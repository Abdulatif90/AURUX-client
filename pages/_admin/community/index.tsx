import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Stack, MenuItem } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import CommunityArticleList from '../../../libs/components/admin/community/CommunityArticleList';
import { AllBoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticle, BoardArticles } from '../../../libs/types/board-article/board-article';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';

interface AdminCommunityProps { initialInquiry?: AllBoardArticlesInquiry; }
const defaultCommunityInquiry: AllBoardArticlesInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};
const AdminCommunity: NextPage<AdminCommunityProps> = ({ initialInquiry = defaultCommunityInquiry }) => {
	const [anchorEl, setAnchorEl] = useState<(HTMLElement | null)[]>([]);
	const [communityInquiry, setCommunityInquiry] = useState<AllBoardArticlesInquiry>(initialInquiry);
	const [value, setValue] = useState(
		communityInquiry?.search?.articleStatus ? communityInquiry?.search?.articleStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/

	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);
	const {
		loading: getAllBoardArticlesByAdminLoading,
		data: getAllBoardArticlesByAdminData,
		error: getAllBoardArticlesByAdminError,
		refetch: getAllBoardArticlesByAdminRefetch,
	} = useQuery<{ getAllBoardArticleByAdmin: BoardArticles }>(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: communityInquiry },
		notifyOnNetworkStatusChange: true,
	});

	const articles = getAllBoardArticlesByAdminData?.getAllBoardArticleByAdmin?.list ?? [];
	const articleTotal = getAllBoardArticlesByAdminData?.getAllBoardArticleByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		getAllBoardArticlesByAdminRefetch({ input: communityInquiry }).then();
	}, [communityInquiry, getAllBoardArticlesByAdminRefetch]);

	/** HANDLERS **/
	const changePageHandler = async (_event: unknown, newPage: number) => {
		const updated = { ...communityInquiry, page: newPage + 1 };
		await getAllBoardArticlesByAdminRefetch({ input: updated });
		setCommunityInquiry(updated);
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const updated = { ...communityInquiry, limit: parseInt(event.target.value, 10), page: 1 };
		await getAllBoardArticlesByAdminRefetch({ input: updated });
		setCommunityInquiry(updated);
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
				setCommunityInquiry({ ...communityInquiry, page: 1, sort: 'createdAt', search: { articleStatus: BoardArticleStatus.ACTIVE } });
				break;
			case 'DELETE':
				setCommunityInquiry({ ...communityInquiry, page: 1, sort: 'createdAt', search: { articleStatus: BoardArticleStatus.DELETE } });
				break;
			default: {
				const { articleStatus: _, ...restSearch } = communityInquiry?.search ?? {};
				setCommunityInquiry({ ...communityInquiry, page: 1, sort: 'createdAt', search: restSearch });
				break;
			}
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setCommunityInquiry({
					...communityInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...communityInquiry.search,
						articleCategory: newValue as BoardArticleCategory,
					},
				});
			} else {
				const { articleCategory: _, ...restSearch } = communityInquiry?.search ?? {};
				setCommunityInquiry({ ...communityInquiry, page: 1, sort: 'createdAt', search: restSearch });
			}
		} catch (err: unknown) {
			console.log('searchTypeHandler: ', err instanceof Error ? err.message : String(err));
		}
	};

	const updateArticleHandler = async (input: { _id: string; articleStatus: string }) => {
		try {
			const updateData: BoardArticleUpdate = { _id: input._id, articleStatus: input.articleStatus as BoardArticleStatus };
			console.log('+updateData: ', updateData);
			await updateBoardArticleByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
		} catch (err: unknown) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	const removeArticleHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('are you sure to remove?')) {
				await removeBoardArticleByAdmin({
					variables: {
						input: id,
					},
				});
				await getAllBoardArticlesByAdminRefetch({ input: communityInquiry });
			}
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};

	console.log('+communityInquiry', communityInquiry);
	console.log('+articles', articles);

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Arricle List
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
									{Object.values(BoardArticleCategory).map((category: string) => (
										<MenuItem value={category} onClick={() => searchTypeHandler(category)} key={category}>
											{category}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<CommunityArticleList
							articles={articles}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateArticleHandler={updateArticleHandler}
							removeArticleHandler={removeArticleHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={articleTotal}
							rowsPerPage={communityInquiry?.limit}
							page={communityInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(AdminCommunity);
