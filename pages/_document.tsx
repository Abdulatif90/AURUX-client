import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.png" />

				{/* SEO */}
				<meta name="keyword" content={'aurux, aurux.uz, mern, mern nestjs fullstack'} />
				<meta
					name={'description'}
					content={
						'Buy and sell vehicles anywhere anytime in South Korea. Best Vehicles at Best prices on aurux.uz | ' +
						'Покупайте и продавайте транспортные средства в любой точке Южной Кореи в любое время. Лучшая недвижимость по лучшим ценам на aurux.uz | ' +
						'대한민국 언제 어디서나 차량을 사고팔 수 있습니다. Aurux.uz에서 최적의 가격으로 최고의 부동산을 만나보세요'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
