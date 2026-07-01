import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Button, InputAdornment, Stack, MenuItem } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { FaqArticlesPanelList } from '../../../libs/components/admin/cs/FaqList';
import { AllBoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticle, BoardArticles } from '../../../libs/types/board-article/board-article';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';

interface AdminFaqProps {
	initialInquiry?: AllBoardArticlesInquiry;
}

const defaultFaqInquiry: AllBoardArticlesInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const FaqArticles: NextPage<AdminFaqProps> = ({ initialInquiry = defaultFaqInquiry }) => {
	const [anchorEl, setAnchorEl] = useState<(HTMLElement | null)[]>([]);
	const [faqInquiry, setFaqInquiry] = useState<AllBoardArticlesInquiry>(initialInquiry);
	const [tabValue, setTabValue] = useState<string>('ALL');
	const [searchCategory, setSearchCategory] = useState<string>('ALL');
	const [searchInput, setSearchInput] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

	const {
		data: getAllBoardArticlesByAdminData,
		refetch: getAllBoardArticlesByAdminRefetch,
	} = useQuery<{ getAllBoardArticleByAdmin: BoardArticles }>(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: faqInquiry },
		notifyOnNetworkStatusChange: true,
	});

	const articles: BoardArticle[] = getAllBoardArticlesByAdminData?.getAllBoardArticleByAdmin?.list ?? [];
	const articleTotal: number = getAllBoardArticlesByAdminData?.getAllBoardArticleByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		getAllBoardArticlesByAdminRefetch({ input: faqInquiry }).then();
	}, [faqInquiry, getAllBoardArticlesByAdminRefetch]);

	/** HANDLERS **/
	const changePageHandler = async (_event: unknown, newPage: number) => {
		const updated = { ...faqInquiry, page: newPage + 1 };
		await getAllBoardArticlesByAdminRefetch({ input: updated });
		setFaqInquiry(updated);
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const updated = { ...faqInquiry, limit: parseInt(event.target.value, 10), page: 1 };
		await getAllBoardArticlesByAdminRefetch({ input: updated });
		setFaqInquiry(updated);
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
		setTabValue(newValue);
		switch (newValue) {
			case 'ACTIVE':
				setFaqInquiry({ ...faqInquiry, page: 1, sort: 'createdAt', search: { ...faqInquiry.search, articleStatus: BoardArticleStatus.ACTIVE } });
				break;
			case 'DELETE':
				setFaqInquiry({ ...faqInquiry, page: 1, sort: 'createdAt', search: { ...faqInquiry.search, articleStatus: BoardArticleStatus.DELETE } });
				break;
			default: {
				const { articleStatus: _, ...restSearch } = faqInquiry?.search ?? {};
				setFaqInquiry({ ...faqInquiry, page: 1, sort: 'createdAt', search: restSearch });
				break;
			}
		}
	};

	const searchCategoryHandler = (newCategory: string) => {
		setSearchCategory(newCategory);
		if (newCategory !== 'ALL') {
			setFaqInquiry({ ...faqInquiry, page: 1, search: { ...faqInquiry.search, articleCategory: newCategory as BoardArticleCategory } });
		} else {
			const { articleCategory: _, ...restSearch } = faqInquiry?.search ?? {};
			setFaqInquiry({ ...faqInquiry, page: 1, search: restSearch });
		}
	};

	const handleInput = (value: string) => {
		setSearchInput(value);
	};

	const updateArticleHandler = async (input: { _id: string; articleStatus: string }) => {
		try {
			const updateData: BoardArticleUpdate = { _id: input._id, articleStatus: input.articleStatus as BoardArticleStatus };
			await updateBoardArticleByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await getAllBoardArticlesByAdminRefetch({ input: faqInquiry });
		} catch (err: unknown) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	const removeArticleHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('are you sure to remove?')) {
				await removeBoardArticleByAdmin({ variables: { input: id } });
				await getAllBoardArticlesByAdminRefetch({ input: faqInquiry });
			}
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'}>FAQ Management</Typography>
				<Button className="btn_add" variant={'contained'} size={'medium'}>
					<AddRoundedIcon sx={{ mr: '8px' }} />
					ADD
				</Button>
			</Box>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={tabValue}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem
									onClick={() => tabChangeHandler('ALL')}
									value="ALL"
									className={tabValue === 'ALL' ? 'li on' : 'li'}
								>
									All ({articleTotal})
								</ListItem>
								<ListItem
									onClick={() => tabChangeHandler('ACTIVE')}
									value="ACTIVE"
									className={tabValue === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={() => tabChangeHandler('DELETE')}
									value="DELETE"
									className={tabValue === 'DELETE' ? 'li on' : 'li'}
								>
									Delete
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={searchCategory}>
									<MenuItem value={'ALL'} onClick={() => searchCategoryHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(BoardArticleCategory).map((category: string) => (
										<MenuItem value={category} onClick={() => searchCategoryHandler(category)} key={category}>
											{category}
										</MenuItem>
									))}
								</Select>
								<OutlinedInput
									value={searchInput}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e.target.value)}
									sx={{ width: '100%' }}
									className={'search'}
									placeholder="Search article title"
									onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
										if (event.key === 'Enter') {
											setFaqInquiry({ ...faqInquiry, page: 1 });
										}
									}}
									endAdornment={
										<>
											{searchInput && (
												<CancelRoundedIcon
													onClick={() => {
														setSearchInput('');
														const { articleCategory: _, ...restSearch } = faqInquiry?.search ?? {};
														setFaqInquiry({ ...faqInquiry, page: 1, search: restSearch });
													}}
												/>
											)}
											<InputAdornment position="end">
												<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
											</InputAdornment>
										</>
									}
								/>
							</Stack>
							<Divider />
						</Box>
						<FaqArticlesPanelList
							dense={false}
							articles={articles}
							anchorEl={anchorEl}
							handleMenuIconClick={menuIconClickHandler}
							handleMenuIconClose={menuIconCloseHandler}
							updateArticleHandler={updateArticleHandler}
							removeArticleHandler={removeArticleHandler}
						/>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={articleTotal}
							rowsPerPage={faqInquiry.limit}
							page={faqInquiry.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(FaqArticles);
