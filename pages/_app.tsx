import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const [theme, setTheme] = useState(createTheme(light as ThemeOptions));
	const client = useApollo(pageProps.initialApolloState);
	const router = useRouter();

	useEffect(() => {
		const handleRouteChangeError = (error: Error) => {
			console.warn('Router error:', error);
		};
		router.events.on('routeChangeError', handleRouteChangeError);
		return () => {
			router.events.off('routeChangeError', handleRouteChangeError);
		};
	}, [router.events]);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
