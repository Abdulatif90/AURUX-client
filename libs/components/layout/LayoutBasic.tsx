import React, { useEffect, ComponentType  } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import useAuthSync from '../../hooks/useAuthSync';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const PAGE_META: Record<string, { title: string; desc: string; bgImage: string }> = {
    '/property': {
        title: 'property.search.title',
        desc: 'property.search.desc',
        bgImage: '/img/banner/2.jpg',
    },
    '/agent': {
        title: 'agent.title',
        desc: 'agent.desc',
        bgImage: '/img/banner/agents.webp',
    },
    '/agent/detail': {
        title: 'agent.detail.title',
        desc: 'agent.detail.desc',
        bgImage: '/img/banner/header2.svg',
    },
    '/mypage': {
        title: 'mypage.title',
        desc: 'mypage.desc',
        bgImage: '/img/banner/header1.svg',
    },
    '/community': {
        title: 'community.title',
        desc: 'community.desc',
        bgImage: '/img/banner/header2.svg',
    },
    '/community/detail': {
        title: 'community.detail.title',
        desc: 'community.detail.desc',
        bgImage: '/img/banner/header2.svg',
    },
    '/cs': {
        title: 'cs.title',
        desc: 'cs.desc',
        bgImage: '/img/banner/header2.svg',
    },
    '/account/join': {
        title: 'auth.title',
        desc: 'auth.desc',
        bgImage: '/img/banner/header2.svg',
    },
    '/member': {
        title: 'member.title',
        desc: 'member.desc',
        bgImage: '/img/banner/header1.svg',
    },
    '/about': {
        title: 'about.title',
        desc: 'about.desc',
        bgImage: '/img/banner/2.jpg',
    },
};
const DEFAULT_META = {
    title: 'default.title',
    desc: 'default.desc',
    bgImage: '/img/banner/default.jpg',
};

const withLayoutBasic = <P extends object>(Component: ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
        const router = useRouter();
        const { t } = useTranslation('common');
        const device = useDeviceDetect();
		useAuthSync();
	    const isAuthHeader = router.pathname === '/account/join';
        const meta = PAGE_META[router.pathname] ?? DEFAULT_META;
        const title = meta.title;
        const desc = meta.desc;
		const bgImage = meta.bgImage;
	
		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/
	return(
	<>
		<Head>
		  <title>{title ? `${t(title)} | Aurux` : 'Aurux'}</title>
		  <meta name="description" content={t(desc)} />
		  <meta property="og:title" content={t(title)} />
		  <meta property="og:description" content={t(desc)} />
		</Head>

		{device ==='mobile'? (
				   <Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
			)
		 :
			(
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>
						<Stack
							className={`header-basic ${isAuthHeader ? 'auth' : ''}`}
							style={{
								backgroundImage: `url(${bgImage})`,
								backgroundSize: 'cover',
								boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
							}}
						>
							<Stack className={'container'}>
								<strong>{t(title)}</strong>
								<span>{t(desc)}</span>
							</Stack>
						</Stack>
						<Stack id={'main'}>
							<Component {...props} />
						</Stack>
						<Chat />
						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
			)}
	</>
	)};
	WrappedComponent.displayName = `withLayoutBasic(${Component.displayName || Component.name || 'Component'})`;
    return WrappedComponent;      
};

export default withLayoutBasic;
