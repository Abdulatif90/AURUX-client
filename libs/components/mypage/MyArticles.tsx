import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import CommunityCard from '../common/CommunityCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { BoardArticle, BoardArticles } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { Direction } from '../../enums/common.enum';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface MyArticlesProps {
	initialInput?: BoardArticlesInquiry;
}

const defaultMyArticlesInput: BoardArticlesInquiry = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const MyArticles: NextPage<MyArticlesProps> = ({ initialInput = defaultMyArticlesInput }: MyArticlesProps) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	/** APOLLO REQUESTS **/

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getboardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
	});

	const boardArticles = boardArticlesData?.getBoardArticles?.list ?? [];
	const totalCount = boardArticlesData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;


	const LIKE_SUCCESS_ALERT_DURATION_MS = 800;

	/** HANDLERS **/
	const paginationHandler = (_event: React.ChangeEvent<unknown>, value: number): void => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeArticleHandler = async (e: React.MouseEvent, user: CustomJwtPayload, id: string): Promise<void> => {
		e.stopPropagation();
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetBoardArticle({
				variables: { input: id },
			});

			await boardArticlesRefetch({ input: searchCommunity });

			await sweetTopSmallSuccessAlert('Success', LIKE_SUCCESS_ALERT_DURATION_MS);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			console.log('Error, likeArticleHandler', message);
			sweetMixinErrorAlert(message).then();
		}
	};


	if (boardArticlesLoading) {
		return <div id="my-articles-page"><p>Loading...</p></div>;
	}

	if (getboardArticlesError) {
		return <div id="my-articles-page"><p>Failed to load articles.</p></div>;
	}

	if (device === 'mobile') {
		return <>ARTICLE PAGE MOBILE</>;
	} else
		return (
			<div id="my-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Article</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="article-list-box">
					{boardArticles?.length > 0 ? (
						boardArticles?.map((boardArticle: BoardArticle) => {
							return (
								<CommunityCard
									likeArticleHandler={likeArticleHandler}
									boardArticle={boardArticle}
									key={boardArticle?._id}
									size={'small'}
								/>
							);
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Articles found!</p>
						</div>
					)}
				</Stack>

				{boardArticles?.length > 0 && (
					<Stack className="pagination-conf">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total">
							<Typography>Total {totalCount ?? 0} article(s) available</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
};


export default MyArticles;
