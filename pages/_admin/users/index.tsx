import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { Box, InputAdornment, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member, Members } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';

interface AdminUsersProps { initialInquiry?: MembersInquiry; }
const defaultMembersInquiry: MembersInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	search: {},
};
const AdminUsers: NextPage<AdminUsersProps> = ({ initialInquiry = defaultMembersInquiry }) => {
	const [anchorEl, setAnchorEl] = useState<Record<string | number, HTMLElement | null>>({});
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [value, setValue] = useState(
		membersInquiry?.search?.memberStatus ? membersInquiry?.search?.memberStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/

	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);
	const {
		loading: getAllMembersByAdminLoading,
		data: getAllMembersByAdminData,
		error: getAllMembersByAdminError,
		refetch: getAllMembersByAdminRefetch,
	} = useQuery<{ getAllMembersByAdmin: Members }>(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: membersInquiry },
		notifyOnNetworkStatusChange: true,
	});

	const members = getAllMembersByAdminData?.getAllMembersByAdmin?.list ?? [];
	const membersTotal = getAllMembersByAdminData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		getAllMembersByAdminRefetch({ input: membersInquiry }).then();
	}, [membersInquiry, getAllMembersByAdminRefetch]);

	/** HANDLERS **/
	const changePageHandler = (_event: unknown, newPage: number) => {
		setMembersInquiry((prev) => ({ ...prev, page: newPage + 1 }));
	};

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		setMembersInquiry((prev) => ({ ...prev, limit: parseInt(event.target.value, 10), page: 1 }));
	};

	const menuIconClickHandler = (e: React.MouseEvent<HTMLButtonElement>, key: number | string) => {
		setAnchorEl({ ...anchorEl, [key]: e.currentTarget });
	};

	const menuIconCloseHandler = () => {
		setAnchorEl({});
	};

	const tabChangeHandler = (newValue: string) => {
		setValue(newValue);
		setSearchText('');

		switch (newValue) {
			case 'ACTIVE':
				setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt', search: { memberStatus: MemberStatus.ACTIVE } });
				break;
			case 'BLOCKED':
				setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt', search: { memberStatus: MemberStatus.BLOCKED } });
				break;
			case 'DELETED':
				setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt', search: { memberStatus: MemberStatus.DELETED } });
				break;
			default: {
				const { memberStatus: _, ...restSearch } = membersInquiry?.search ?? {};
				setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt', search: restSearch });
				break;
			}
		}
	};

	const updateMemberHandler = async (input: { _id: string; memberType?: string; memberStatus?: string }) => {
		try {
			const updateData: MemberUpdate = {
				_id: input._id,
				...(input.memberType && { memberType: input.memberType as MemberType }),
				...(input.memberStatus && { memberStatus: input.memberStatus as MemberStatus }),
			};
			await updateMemberByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
			await getAllMembersByAdminRefetch({ input: membersInquiry });
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};

	const textHandler = useCallback((value: string) => {
		try {
			setSearchText(value);
		} catch (err: unknown) {
			console.log('textHandler: ', err instanceof Error ? err.message : String(err));
		}
	}, []);

	const searchTextHandler = () => {
		try {
			setMembersInquiry({
				...membersInquiry,
				search: {
					...membersInquiry.search,
					text: searchText,
				},
			});
		} catch (err: unknown) {
			console.log('searchTextHandler: ', err instanceof Error ? err.message : String(err));
		}
	};

	const searchTypeHandler = (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setMembersInquiry({
					...membersInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...membersInquiry.search,
						memberType: newValue as MemberType,
					},
				});
			} else {
				const { memberType: _, ...restSearch } = membersInquiry?.search ?? {};
				setMembersInquiry({ ...membersInquiry, search: restSearch });
			}
		} catch (err: unknown) {
			console.log('searchTypeHandler: ', err instanceof Error ? err.message : String(err));
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Member List
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
									onClick={() => tabChangeHandler('BLOCKED')}
									value="BLOCKED"
									className={value === 'BLOCKED' ? 'li on' : 'li'}
								>
									Blocked
								</ListItem>
								<ListItem
									onClick={() => tabChangeHandler('DELETED')}
									value="DELETED"
									className={value === 'DELETED' ? 'li on' : 'li'}
								>
									Deleted
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<OutlinedInput
									value={searchText}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => textHandler(e.target.value)}
									sx={{ width: '100%' }}
									className={'search'}
									placeholder="Search user name"
									onKeyDown={(event) => {
										if (event.key === 'Enter') searchTextHandler();
									}}
									endAdornment={
										<>
											{searchText && (
												<CancelRoundedIcon
													style={{ cursor: 'pointer' }}
													onClick={async () => {
														setSearchText('');
														setMembersInquiry({
															...membersInquiry,
															search: {
																...membersInquiry.search,
																text: '',
															},
														});
														await getAllMembersByAdminRefetch({ input: membersInquiry });
													}}
												/>
											)}
											<InputAdornment position="end" onClick={() => searchTextHandler()}>
												<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
											</InputAdornment>
										</>
									}
								/>
								<Select sx={{ width: '160px', ml: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										All
									</MenuItem>
									<MenuItem value={'USER'} onClick={() => searchTypeHandler('USER')}>
										User
									</MenuItem>
									<MenuItem value={'AGENT'} onClick={() => searchTypeHandler('AGENT')}>
										Agent
									</MenuItem>
									<MenuItem value={'ADMIN'} onClick={() => searchTypeHandler('ADMIN')}>
										Admin
									</MenuItem>
								</Select>
							</Stack>
							<Divider />
						</Box>
						<MemberPanelList
							members={members}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateMemberHandler={updateMemberHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={membersTotal}
							rowsPerPage={membersInquiry?.limit}
							page={membersInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(AdminUsers);
