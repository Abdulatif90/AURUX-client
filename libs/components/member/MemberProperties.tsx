import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from '../mypage/PropertyCard';
import { Properties, Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';

interface MemberPropertiesProps {
	initialInput?: PropertiesInquiry;
}

const defaultInitialInput: PropertiesInquiry = {
	page: 1,
	limit: 5,
	sort: 'createdAt',
	search: { memberId: '' },
};

const MyProperties: NextPage<MemberPropertiesProps> = ({ initialInput = defaultInitialInput }: MemberPropertiesProps) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>({ ...initialInput });
	/** APOLLO REQUESTS **/
	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
	} = useQuery<{ getProperties: Properties }>(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
	});

	const agentProperties = getPropertiesData?.getProperties?.list ?? [];
	const total = getPropertiesData?.getProperties?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		if (memberId) {
			const id = Array.isArray(memberId) ? memberId[0] : memberId;
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: id } });
		}
	}, [memberId, initialInput]);

	/** HANDLERS **/
	const paginationHandler = (_event: React.ChangeEvent<unknown>, value: number): void => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (getPropertiesLoading) {
		return <div id="member-properties-page"><p>Loading...</p></div>;
	}

	if (getPropertiesError) {
		return <div id="member-properties-page"><p>Failed to load properties.</p></div>;
	}

	if (device === 'mobile') {
		return <div>AURUX PROPERTIES MOBILE</div>;
	} else {
		return (
			<div id="member-properties-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Properties</Typography>
					</Stack>
				</Stack>
				<Stack className="properties-list-box">
					<Stack className="list-box">
						{agentProperties?.length > 0 && (
							<Stack className="listing-title-box">
								<Typography className="title-text">Listing title</Typography>
								<Typography className="title-text">Date Published</Typography>
								<Typography className="title-text">Status</Typography>
								<Typography className="title-text">View</Typography>
							</Stack>
						)}
						{agentProperties?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Property found!</p>
							</div>
						)}
						{agentProperties?.map((property: Property) => {
							return <PropertyCard property={property} memberPage={true} key={property?._id} />;
						})}

						{agentProperties.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} property available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

export default MyProperties;
