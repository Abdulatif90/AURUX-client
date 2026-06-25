import React, { useEffect,ComponentType } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutFull = <P extends object>(Component: ComponentType<P>) => {
    const WrappedComponent  = (props: P) => {
		const router = useRouter();
		const device = useDeviceDetect();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/
	return(
		<>
		<Head>
				<title>Aurux</title>
				<meta name="description" content={Aurux} />
		</Head>
			{device === 'mobile'?
				(
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
		: (
				<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
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
	WrappedComponent.displayName = `withLayoutFull(${Component.displayName || Component.name || 'Component'})`;
    return WrappedComponent;      
};

export default withLayoutFull;
