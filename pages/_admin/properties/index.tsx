import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { PropertyPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { AllPropertiesInquiry } from '../../../libs/types/property/property.input';
import { Properties, Property } from '../../../libs/types/property/property';
import { PropertyLocation, PropertyStatus } from '../../../libs/enums/property.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { PropertyUpdate } from '../../../libs/types/property/property.update';
import { REMOVE_PROPERTY_BY_ADMIN, UPDATE_PROPERTY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../../apollo/admin/query';

interface AdminPropertiesProps { initialInquiry?: AllPropertiesInquiry; }
const defaultPropertiesInquiry: AllPropertiesInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};
const AdminProperties: NextPage<AdminPropertiesProps> = ({ initialInquiry = defaultPropertiesInquiry }) => {
	const [anchorEl, setAnchorEl] = useState<(HTMLElement | null)[]>([]);
	const [propertiesInquiry, setPropertiesInquiry] = useState<AllPropertiesInquiry>(initialInquiry);
	const [value, setValue] = useState(
		propertiesInquiry?.search?.propertyStatus ? propertiesInquiry?.search?.propertyStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/

	const [updatePropertyByAdmin] = useMutation(UPDATE_PROPERTY_BY_ADMIN);
	const [removeePropertyByAdmin] = useMutation(REMOVE_PROPERTY_BY_ADMIN);
	const {
		loading: getAllPropertiesByAdminLoading,
		data: getAllPropertiesByAdminData,
		error: getAllPropertiesByAdminError,
		refetch: getAllPropertiesByAdminRefetch,
	} = useQuery<{ getAllPropertiesByAdmin: Properties }>(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: propertiesInquiry },
		notifyOnNetworkStatusChange: true,
	});

	const properties = getAllPropertiesByAdminData?.getAllPropertiesByAdmin?.list ?? [];
	const propertiesTotal = getAllPropertiesByAdminData?.getAllPropertiesByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		getAllPropertiesByAdminRefetch({ input: propertiesInquiry }).then();
	}, [propertiesInquiry, getAllPropertiesByAdminRefetch]);

	/** HANDLERS **/
	const changePageHandler = (_event: unknown, newPage: number) => {
		setPropertiesInquiry((prev) => ({ ...prev, page: newPage + 1 }));
	};

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPropertiesInquiry((prev) => ({ ...prev, limit: parseInt(event.target.value, 10), page: 1 }));
	};

	const menuIconClickHandler = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = (newValue: string) => {
		setValue(newValue);

		switch (newValue) {
			case 'ACTIVE':
				setPropertiesInquiry({ ...propertiesInquiry, page: 1, sort: 'createdAt', search: { propertyStatus: PropertyStatus.ACTIVE } });
				break;
			case 'SOLD':
				setPropertiesInquiry({ ...propertiesInquiry, page: 1, sort: 'createdAt', search: { propertyStatus: PropertyStatus.SOLD } });
				break;
			case 'DELETE':
				setPropertiesInquiry({ ...propertiesInquiry, page: 1, sort: 'createdAt', search: { propertyStatus: PropertyStatus.DELETE } });
				break;
			default: {
				const { propertyStatus: _, ...restSearch } = propertiesInquiry?.search ?? {};
				setPropertiesInquiry({ ...propertiesInquiry, page: 1, sort: 'createdAt', search: restSearch });
				break;
			}
		}
	};

	const removePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeePropertyByAdmin({
					variables: {
						input: id,
					},
				});
				await getAllPropertiesByAdminRefetch({ input: propertiesInquiry });
			}
			menuIconCloseHandler();
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setPropertiesInquiry({
					...propertiesInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...propertiesInquiry.search,
						propertyLocationList: [newValue as PropertyLocation],
					},
				});
			} else {
				const { propertyLocationList: _, ...restSearch } = propertiesInquiry?.search ?? {};
				setPropertiesInquiry({ ...propertiesInquiry, page: 1, sort: 'createdAt', search: restSearch });
			}
		} catch (err: unknown) {
			console.log('searchTypeHandler: ', err instanceof Error ? err.message : String(err));
		}
	};

	const updatePropertyHandler = async (input: { _id: string; propertyStatus: string }) => {
		try {
			const updateData: PropertyUpdate = { _id: input._id, propertyStatus: input.propertyStatus as PropertyStatus };
			console.log('+updateData: ', updateData);
			await updatePropertyByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
			await getAllPropertiesByAdminRefetch({ input: propertiesInquiry });
		} catch (err: unknown) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Property List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem
									onClick={() => tabChangeHandler('ALL')}
									value="ALL"
									className={value === 'ALL' ? 'li on' : 'li'}
								>
									All
								</ListItem>
								<ListItem
									onClick={() => tabChangeHandler('ACTIVE')}
									value="ACTIVE"
									className={value === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={() => tabChangeHandler('SOLD')}
									value="SOLD"
									className={value === 'SOLD' ? 'li on' : 'li'}
								>
									Sold
								</ListItem>
								<ListItem
									onClick={() => tabChangeHandler('DELETE')}
									value="DELETE"
									className={value === 'DELETE' ? 'li on' : 'li'}
								>
									Delete
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(PropertyLocation).map((location: string) => (
										<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>
											{location}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<PropertyPanelList
							properties={properties}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updatePropertyHandler={updatePropertyHandler}
							removePropertyHandler={removePropertyHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={propertiesTotal}
							rowsPerPage={propertiesInquiry?.limit}
							page={propertiesInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(AdminProperties);
