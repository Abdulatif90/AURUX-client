import React, { useCallback } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';

const SWIPER_MODULES_MOBILE = [Autoplay];
const SWIPER_MODULES_PC = [Autoplay, Navigation, Pagination];
import TopPropertyCard from './TopPropertyCard';
import { PropertiesInquiry } from '../../types/property/property.input';
import { Properties, Property } from '../../types/property/property';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';

interface TopPropertiesProps {
	initialInput: PropertiesInquiry;
}

const TopProperties = (props: TopPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		data: getPropertiesData,
		refetch: getPropertiesRefetch,
	} = useQuery<{ getProperties: Properties }>(GET_PROPERTIES, {
		fetchPolicy: 'cache-first',
		variables: { input: initialInput },
	});

	const topProperties = getPropertiesData?.getProperties?.list ?? [];

	/** HANDLERS **/

	const likePropertyHandler = useCallback(async (user: CustomJwtPayload, id: string): Promise<void> => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: initialInput });
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			console.log('Error, likePropertyHandler', message);
			sweetMixinErrorAlert(message).then();
		}
	}, [likeTargetProperty, getPropertiesRefetch, initialInput]);

	if (device === 'mobile') {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top properties</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-property-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={15}
							modules={SWIPER_MODULES_MOBILE}
						>
							{topProperties.map((property: Property) => {
								return (
									<SwiperSlide className={'top-property-slide'} key={property?._id}>
										<TopPropertyCard property={property} likePropertyHandler={likePropertyHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top properties</span>
							<p>Check out our Top Properties</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-top-prev'} />
								<div className={'swiper-top-pagination'}></div>
								<EastIcon className={'swiper-top-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-property-swiper'}
							slidesPerView={'auto'}
							spaceBetween={15}
							modules={SWIPER_MODULES_PC}
							navigation={{
								nextEl: '.swiper-top-next',
								prevEl: '.swiper-top-prev',
							}}
							pagination={{
								el: '.swiper-top-pagination',
							}}
						>
							{topProperties.map((property: Property) => {
								return (
									<SwiperSlide className={'top-property-slide'} key={property?._id}>
										<TopPropertyCard property={property} likePropertyHandler={likePropertyHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'propertyRank',
		direction: 'DESC',
		search: {},
	},
};

export default React.memo(TopProperties);
