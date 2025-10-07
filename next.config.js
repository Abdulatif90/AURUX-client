/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		// Legacy React environment variables
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS_URL: process.env.REACT_APP_API_WS_URL,
		// Next.js environment variables
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_API_GRAPHQL_URL: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		NEXT_PUBLIC_API_WS: process.env.NEXT_PUBLIC_API_WS,
	},
	// Add experimental features for better stability
	experimental: {
		esmExternals: false,
	},
	// Improve webpack configuration
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
			};
		}
		return config;
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
