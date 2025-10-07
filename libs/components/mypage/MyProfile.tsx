import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/

	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberImage: user.memberImage,
		});
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			console.log('+image:', image);

			if (!image) {
				alert('Rasm tanlanmadi');
				return;
			}

			if (!token) {
				alert('Avval tizimga kiring');
				return;
			}

			// Rasm formatini tekshirish
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
			if (!allowedTypes.includes(image.type)) {
				alert('Faqat JPG, JPEG, PNG formatdagi rasmlar ruxsat etilgan');
				return;
			}

			// Rasm hajmini tekshirish (5MB dan kichik bo'lishi kerak)
			const maxSize = 5 * 1024 * 1024; // 5MB
			if (image.size > maxSize) {
				alert('Rasm hajmi 5MB dan kichik bo\'lishi kerak');
				return;
			}

			console.log('Rasm ma\'lumotlari:', {
				name: image.name,
				type: image.type,
				size: (image.size / 1024 / 1024).toFixed(2) + 'MB'
			});

			const formData = new FormData();
			
			// GraphQL operatsiyasini to'g'ri formatda tayyorlash
			const operations = {
				query: `
					mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}
				`,
				variables: {
					file: null,
					target: "member"
				}
			};

			const map = {
				"0": ["variables.file"]
			};

			formData.append('operations', JSON.stringify(operations));
			formData.append('map', JSON.stringify(map));
			formData.append('0', image);

			console.log('Mutation yuborilmoqda:', operations.query);
			console.log('Variables:', operations.variables);

			// URL'larni tekshirish va to'g'rilash
			const graphqlUrl = process.env.REACT_APP_API_GRAPHQL_URL || 
							  process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 
							  'http://localhost:4000/graphql';
			
			console.log('GraphQL URL:', graphqlUrl);
			console.log('API Base URL:', REACT_APP_API_URL);

			const response = await axios.post(graphqlUrl, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			console.log('Server javobi:', response.data);

			// Javobni batafsil tekshirish
			if (response.data?.data?.imageUploader) {
				const responseImage = response.data.data.imageUploader;
				console.log('Yuklangan rasm:', responseImage);
				
				// State'larni yangilash
				const newUpdateData = { ...updateData, memberImage: responseImage };
				setUpdateData(newUpdateData);
				
				// User global state'ni yangilash
				const updatedUser = { ...user, memberImage: responseImage };
				userVar(updatedUser);
				
				// LocalStorage'ni yangilash
				updateUserInfo(updatedUser);
				
				// Force re-render uchun
				window.dispatchEvent(new Event('userImageUpdated'));
				
				console.log('Final image URL:', `${REACT_APP_API_URL}${responseImage}`);
				console.log('Updated user:', updatedUser);
				console.log('Global userVar updated:', userVar());
				alert('Rasm muvaffaqiyatli yuklandi va profil yangilandi!');
				return `${REACT_APP_API_URL}${responseImage}`;
			} 
			
			// Server xatolarini tekshirish
			if (response.data?.errors) {
				const error = response.data.errors[0];
				console.error('GraphQL xatolik:', error);
				throw new Error(error.message || 'Server xatoligi');
			}
			
			// Noma'lum format
			console.error('Kutilmagan javob:', response.data);
			throw new Error('Server noto\'g\'ri javob qaytardi');
		} catch (err: any) {
			console.error('Upload xatolik:', err);
			console.error('Server response:', err.response?.data);
			
			// Server javobidagi aniq xato
			let errorMessage = 'Rasm yuklashda xatolik';
			
			if (err.response?.data?.errors) {
				errorMessage = err.response.data.errors[0]?.message || errorMessage;
			} else if (err.message) {
				errorMessage = err.message;
			}
			
			console.error('Final error message:', errorMessage);
			alert(errorMessage);
			
			throw new Error(errorMessage);
		}
	};

	const handleImageUpload = (e: any) => {
		uploadImage(e).catch(error => {
			console.error('Rasm yuklash muvaffaqiyatsiz:', error);
		});
	};

	const updatePropertyHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			updateData._id = user._id;
			const result = await updateMember({
				variables: {
					input: updateData,
				},
			});

			//@ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('Information updated successfully');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData]);

	const doDisabledCheck = () => {
		if (
			updateData.memberNick === '' ||
			updateData.memberPhone === '' ||
			updateData.memberAddress === '' ||
			updateData.memberImage === ''
		) {
			return true;
		}
	};

	console.log('+updateData', updateData);
	console.log('Current memberImage:', updateData?.memberImage);
	console.log('Full image URL:', updateData?.memberImage ? `${REACT_APP_API_URL}/${updateData?.memberImage}` : 'No image');

	if (device === 'mobile') {
		return <>MY PROFILE PAGE MOBILE</>;
	} else
		return (
			<div id="my-profile-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Profile</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="top-box">
					<Stack className="photo-box">
						<Typography className="title">Photo</Typography>
						<Stack className="image-big-box">
							<Stack className="image-box">
								<img
									src={
										updateData?.memberImage
											? `${REACT_APP_API_URL}${updateData?.memberImage}`
											: `/img/profile/defaultUser.svg`
									}
									alt=""
									onError={(e) => {
										console.error('Rasm yuklanmadi:', `${REACT_APP_API_URL}${updateData?.memberImage}`);
										e.currentTarget.src = '/img/profile/defaultUser.svg';
									}}
								/>
							</Stack>
							<Stack className="upload-big-box">
								<input
									type="file"
									hidden
									id="hidden-input"
									onChange={handleImageUpload}
									accept="image/jpg, image/jpeg, image/png"
								/>
								<label htmlFor="hidden-input" className="labeler">
									<Typography>Upload Profile Image</Typography>
								</label>
								<Typography className="upload-text">A photo must be in JPG, JPEG or PNG format!</Typography>
							</Stack>
						</Stack>
					</Stack>
					<Stack className="small-input-box">
						<Stack className="input-box">
							<Typography className="title">Username</Typography>
							<input
								type="text"
								placeholder="Your username"
								value={updateData.memberNick}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
							/>
						</Stack>
						<Stack className="input-box">
							<Typography className="title">Phone</Typography>
							<input
								type="text"
								placeholder="Your Phone"
								value={updateData.memberPhone}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
							/>
						</Stack>
					</Stack>
					<Stack className="address-box">
						<Typography className="title">Address</Typography>
						<input
							type="text"
							placeholder="Your address"
							value={updateData.memberAddress}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
						/>
					</Stack>
					<Stack className="about-me-box">
						<Button className="update-button" onClick={updatePropertyHandler} disabled={doDisabledCheck()}>
							<Typography>Update Profile</Typography>
							<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
								<g clipPath="url(#clip0_7065_6985)">
									<path
										d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
										fill="white"
									/>
								</g>
								<defs>
									<clipPath id="clip0_7065_6985">
										<rect width="13" height="13" fill="white" />
									</clipPath>
								</defs>
							</svg>
						</Button>
					</Stack>
				</Stack>
			</div>
		);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
	},
};

export default MyProfile;