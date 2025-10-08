import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const checkUserTypeHandler = (e: any) => {
		const checked = e.target.checked;
		if (checked) {
			const value = e.target.name;
			handleInput('type', value);
		} else {
			handleInput('type', 'USER');
		}
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		console.warn(input);
		try {
			if (!input.nick || !input.password) {
				await sweetMixinErrorAlert('Please enter both nickname and password.');
				return;
			}
			await logIn(input.nick, input.password);
			await sweetMixinSuccessAlert('Welcome back! Login successful.');
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			// Errors are already handled in auth/index.ts
			console.error('Login error:', err);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		console.warn(input);
		try {
			// Validation checks
			if (!input.nick || !input.password || !input.phone) {
				await sweetMixinErrorAlert('Please fill in all required fields.');
				return;
			}
			
			// Phone number validation - only digits allowed
			const phoneRegex = /^\+?[0-9]{10,15}$/;
			if (!phoneRegex.test(input.phone)) {
				await sweetMixinErrorAlert('Please enter a valid phone number (10-15 digits).');
				return;
			}
			
			// Nickname validation - minimum 3 characters
			if (input.nick.length < 3) {
				await sweetMixinErrorAlert('Nickname must be at least 3 characters long.');
				return;
			}
			
			// Password validation - minimum 4 characters
			if (input.password.length < 4) {
				await sweetMixinErrorAlert('Password must be at least 4 characters long.');
				return;
			}
			
			await signUp(input.nick, input.password, input.phone, input.type);
			// After successful signup, switch to login view
			setLoginView(true);
			// Clear all input fields
			setInput({ nick: '', password: '', phone: '', type: 'USER' });
			// Show success message
			await sweetMixinSuccessAlert('Registration successful! Please login with your credentials.');
		} catch (err: any) {
			// Errors are already handled in auth/index.ts with sweetAlert
			console.error('Signup error:', err);
		}
	}, [input]);

	console.log('+input: ', input);

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	} else {
		return (
			<Stack className={'join-page'}>
				<Stack className={'container'}>
					<Stack className={'main'}>
						<Stack className={'left'}>
							{/* @ts-ignore */}
							<Box className={'logo'}>
								<img src="/img/logo/logoText.svg" alt="" />
								<span>Aurux</span>
							</Box>
							<Box className={'info'}>
								<span>{loginView ? 'login' : 'signup'}</span>
								<p>{loginView ? 'Login' : 'Sign'} in with this account across the following sites.</p>
							</Box>
							<Box className={'input-wrap'}>
								<div className={'input-box'}>
									<span>Nickname</span>
									<input
										type="text"
										placeholder={'Enter Nickname'}
										value={input.nick}
										onChange={(e) => handleInput('nick', e.target.value)}
										required={true}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								<div className={'input-box'}>
									<span>Password</span>
									<input
										type="password"
										placeholder={'Enter Password'}
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
										required={true}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								{!loginView && (
									<div className={'input-box'}>
										<span>Phone</span>
										<input
											type="tel"
											placeholder={'Enter Phone (+998901234567)'}
											value={input.phone}
											onChange={(e) => {
												// Allow only numbers and plus sign
												const value = e.target.value.replace(/[^\d+]/g, '');
												handleInput('phone', value);
											}}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter') doSignUp();
											}}
											maxLength={15}
										/>
									</div>
								)}
							</Box>
							<Box className={'register'}>
								{!loginView && (
									<div className={'type-option'}>
										<span className={'text'}>I want to be registered as:</span>
										<div>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															name={'USER'}
															onChange={checkUserTypeHandler}
															checked={input?.type == 'USER'}
														/>
													}
													label="User"
												/>
											</FormGroup>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															name={'AGENT'}
															onChange={checkUserTypeHandler}
															checked={input?.type == 'AGENT'}
														/>
													}
													label="Agent"
												/>
											</FormGroup>
										</div>
									</div>
								)}

								{loginView && (
									<div className={'remember-info'}>
										<FormGroup>
											<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
										</FormGroup>
										<a>Lost your password?</a>
									</div>
								)}

								{loginView ? (
									<Button
										variant="contained"
										endIcon={<img src="/img/icons/rightup.svg" alt="" />}
										disabled={input.nick == '' || input.password == ''}
										onClick={doLogin}
									>
										LOGIN
									</Button>
								) : (
									<Button
										variant="contained"
										disabled={input.nick == '' || input.password == '' || input.phone == '' || input.type == ''}
										onClick={doSignUp}
										endIcon={<img src="/img/icons/rightup.svg" alt="" />}
									>
										SIGNUP
									</Button>
								)}
							</Box>
							<Box className={'ask-info'}>
								{loginView ? (
									<p>
										Not registered yet?
										<b
											onClick={() => {
												viewChangeHandler(false);
											}}
										>
											SIGNUP
										</b>
									</p>
								) : (
									<p>
										Have account?
										<b onClick={() => viewChangeHandler(true)}> LOGIN</b>
									</p>
								)}
							</Box>
						</Stack>
						<Stack className={'right'}></Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
