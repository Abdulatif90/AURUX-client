import React, { useEffect, useState } from 'react';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import CommunityCard from '../common/CommunityCard';
import { BoardArticle, BoardArticles } from '../../types/board-article/board-article';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Messages } from '../../config';


interface MemberArticlesProps {
    initialInput: BoardArticlesInquiry;
}
const MemberArticles = ({ initialInput }: MemberArticlesProps) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const memberId = router.query.memberId;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);

	/** APOLLO REQUESTS **/
	const [ likeTargetBoardArticle ] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		error: getBoardArticlesError,
		data: boardArticlesData,
		refetch: boardArticlesRefetch,
	} = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
	});

	const memberBoArticles = boardArticlesData?.getBoardArticles?.list ?? [];
	const total = boardArticlesData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
    if (memberId) {
        const id = Array.isArray(memberId) ? memberId[0] : memberId;
        setSearchFilter({ ...initialInput, search: { memberId: id } });
    }
}, [memberId, initialInput]);

	const LIKE_SUCCESS_ALERT_DURATION_MS = 800;

	/** HANDLERS **/
	const paginationHandler = (_event: React.ChangeEvent<unknown>, value: number): void => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const likeBoArticleHandler = async (e: React.MouseEvent, user: CustomJwtPayload, id: string): Promise<void> => {
		try {
			e.stopPropagation();
			if( !id ) return;
			if ( !user?._id ) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: {
						userId: user?._id,
						boardArticleId: id
					}
				}
			});
			await boardArticlesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Success', LIKE_SUCCESS_ALERT_DURATION_MS);

		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : Messages.error1;
			console.log('Error, likeBoArticleHandler', message);
			sweetMixinErrorAlert(message).then();
		}
	};

	if (boardArticlesLoading) {
		return <div id="member-articles-page"><p>Loading...</p></div>;
	}

	if (getBoardArticlesError) {
		return <div id="member-articles-page"><p>Failed to load articles.</p></div>;
	}

	if (device === 'mobile') {
		return <div>MEMBER ARTICLES MOBILE</div>;
	} else {
		return (
			<div id="member-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Articles</Typography>
					</Stack>
				</Stack>
				<Stack className="articles-list-box">
					{memberBoArticles?.length === 0 && (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Articles found!</p>
						</div>
					)}
					{memberBoArticles?.map((boardArticle: BoardArticle) => {
						return <CommunityCard boardArticle={boardArticle} key={boardArticle?._id} likeArticleHandler={likeBoArticleHandler} size={'small'} />;
					})}
				</Stack>
				{memberBoArticles?.length !== 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFilter.limit) || 1}
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
			</div>
		);
	}
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;
