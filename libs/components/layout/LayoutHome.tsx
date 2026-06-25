import React, { ComponentType } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import useAuthSync from '../../hooks/useAuthSync';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import HeaderFilter from '../homepage/HeaderFilter';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutMain = <P extends object>(Component: ComponentType<P>) =>{
	const WrappedComponent = (props: any) => {
		const device = useDeviceDetect();
		useAuthSync();

	
		/** HANDLERS **/

	ruturn (
		<>
			<Head>
				<title>Aurux</title>
				<meta name="description" content={Aurux} />
			</Head>
			{device === 'mobile'? ( 
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
				):
		      (
			<Stack id="pc-wrap">
				<Stack id={'top'}>
					<Top />
				</Stack>
				<Stack className={'header-main'}>
					<Stack className={'container'}>
						<HeaderFilter />
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
	WrappedComponent.displayName = `withLayoutMain(${Component.displayName || Component.name || 'Component'})`;
    return WrappedComponent;  

export default withLayoutMain;
