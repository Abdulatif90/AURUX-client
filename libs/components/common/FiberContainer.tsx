import React, { useRef, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense } from 'react';
import { Preload, Image as ImageImpl } from '@react-three/drei';
import { ScrollControls, Scroll } from './ScrollControls';
import * as THREE from 'three';

// Memoize Image component to prevent unnecessary re-renders
const Image = React.memo((props: any) => {
	const ref = useRef<THREE.Group>();
	const group = useRef<THREE.Group>();

	return (
		// @ts-ignore
		<group ref={group}>
			<ImageImpl ref={ref} {...props} />
		</group>
	);
});

// Memoize Page component
const Page = React.memo(({ m = 0.4, urls, ...props }: any) => {
	const { width } = useThree((state) => state.viewport);
	const w = width < 10 ? 1.5 / 3 : 1 / 3;

	return (
		<group {...props}>
			<Image position={[-width * w, 0, -1]} scale={[width * w - m * 2, 5, 1]} url={urls[0]} />
			<Image position={[0, 0, 0]} scale={[width * w - m * 2, 5, 1]} url={urls[1]} />
			<Image position={[width * w, 0, 1]} scale={[width * w - m * 2, 5, 1]} url={urls[2]} />
		</group>
	);
});

// Memoize Pages component with static data
const Pages = React.memo(() => {
	const { width } = useThree((state) => state.viewport);

	// Memoize page data to prevent recalculation
	const pageData = useMemo(() => [
		{ urls: ['/img/fiber/img7.jpg', '/img/fiber/img8.jpg', '/img/fiber/img1.jpg'] },
		{ urls: ['/img/fiber/img4.jpg', '/img/fiber/img5.jpg', '/img/fiber/img6.jpg'] },
		{ urls: ['/img/fiber/img2.jpg', '/img/fiber/img3.jpg', '/img/fiber/img4.jpg'] },
		{ urls: ['/img/fiber/img7.jpg', '/img/fiber/img8.jpg', '/img/fiber/img1.jpg'] },
		{ urls: ['/img/fiber/img4.jpg', '/img/fiber/img5.jpg', '/img/fiber/img6.jpg'] },
	], []);

	return (
		<>
			{pageData.map((data, index) => (
				<Page key={index} position={[width * index, 0, 0]} urls={data.urls} />
			))}
		</>
	);
});

export default function FiberContainer() {
	return (
		<div className="threeJSContainer" style={{ marginTop: '100px', width: '100%', height: '512px' }}>
			<Canvas 
				gl={{ 
					antialias: false,
					powerPreference: 'high-performance', // Use high-performance GPU
					alpha: false,
					stencil: false, // Disable stencil buffer for better performance
					depth: true,
				}} 
				dpr={[1, 1.5]} // Limit device pixel ratio for better performance
				frameloop="demand" // Only render when needed, not every frame
				performance={{ min: 0.5 }} // Adaptive performance scaling
				shadows={false} // Disable shadows for better performance
				flat // Disable tone mapping for better performance
			>
				<Suspense fallback={null}>
					<ScrollControls infinite horizontal damping={4} pages={4} distance={1}>
						<Scroll>
							<Pages />
						</Scroll>
					</ScrollControls>
					<Preload />
				</Suspense>
			</Canvas>
		</div>

	);
}
