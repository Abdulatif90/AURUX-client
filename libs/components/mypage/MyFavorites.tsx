import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Properties, Property } from '../../types/property/property';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { Messages } from '../../config';

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const [searchFavorites, setSearchFavorites] = useState<{ page: number; limit: number }>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/

	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const {
		loading: getFavoritesLoading,
		data: getFavoritesData,
		error: getFavoritesError,
		refetch: getFavoritesRefetch,
	} = useQuery<{ getFavorites: Properties }>(GET_FAVORITES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFavorites },
	});

	const myFavorites = getFavoritesData?.getFavorites?.list ?? [];
	const total = getFavoritesData?.getFavorites?.metaCounter?.[0]?.total ?? 0;

	const LIKE_SUCCESS_ALERT_DURATION_MS = 800;

	/** HANDLERS **/
	const paginationHandler = (_event: React.ChangeEvent<unknown>, value: number): void => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	const likePropertyHandler = async (user: CustomJwtPayload, id: string): Promise<void> => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetProperty({
				variables: { input: id },
			});

			await getFavoritesRefetch({ input: searchFavorites });

			await sweetTopSmallSuccessAlert('success', LIKE_SUCCESS_ALERT_DURATION_MS);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : Messages.error1;
			console.log('Error, likePropertyHandler', message);
			sweetMixinErrorAlert(message).then();
		}
	};

	if (getFavoritesLoading) return <div id="my-favorites-page"><p>Loading...</p></div>;
	if (getFavoritesError) return <div id="my-favorites-page"><p>Failed to load favorites.</p></div>;

	if (device === 'mobile') {
		return <div>AURUX MY FAVORITES MOBILE</div>;
	} else {
		return (
			<div id="my-favorites-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Favorites</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="favorites-list-box">
					{myFavorites?.length ? (
						myFavorites?.map((property: Property) => {
							return <PropertyCard property={property} myFavorites={true} likePropertyHandler={likePropertyHandler} key={property?._id} />;
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Favorites found!</p>
						</div>
					)}
				</Stack>
				{myFavorites?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								Total {total} favorite propert{total > 1 ? 'ies' : 'y'}
							</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default MyFavorites;
