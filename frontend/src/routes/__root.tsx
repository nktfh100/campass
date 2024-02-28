// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import '@fontsource/rubik/hebrew-400.css';
import '@fontsource/rubik/hebrew-700.css';
import '@fontsource/rubik/latin-400.css';
import '@fontsource/rubik/latin-700.css';

import { useEffect, useRef } from 'react';

import Header from '@/components/layout/Header/Header';
import Analytics from '@/components/shared/Analytics';
import GlobalModal from '@/components/shared/GlobalModal';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
	component: App,
});

function App() {
	const backgroundColorRef = useRef<HTMLDivElement>(null);

	function updateBackgroundHeight() {
		if (backgroundColorRef.current) {
			backgroundColorRef.current.style.height = `${document.body.scrollHeight}px`;
		}
	}

	// Ugly hack to make the background color of the wave continue to the bottom of the page
	useEffect(() => {
		updateBackgroundHeight();

		window.addEventListener("load", updateBackgroundHeight);
		window.addEventListener("scroll", updateBackgroundHeight);

		return () => {
			window.removeEventListener("load", updateBackgroundHeight);
			window.removeEventListener("scroll", updateBackgroundHeight);
		};
	}, []);

	return (
		<>
			<Analytics />
			<Header />
			<Outlet />
			<GlobalModal />
			<div ref={backgroundColorRef} className="background-color" />
			{/* <TanStackRouterDevtools /> */}
		</>
	);
}
