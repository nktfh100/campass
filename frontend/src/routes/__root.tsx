// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "@fontsource/rubik/hebrew-400.css";
import "@fontsource/rubik/hebrew-700.css";
import "@fontsource/rubik/latin-400.css";
import "@fontsource/rubik/latin-700.css";

import Header from "@/components/layout/Header/Header";
import GlobalModal from "@/components/shared/GlobalModal";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const analyticsUrl = import.meta.env.VITE_ANALYTICS_URL as string;

export const Route = createRootRoute({
	component: () => (
		<>
			{analyticsUrl && (
				<>
					<noscript>
						<img src={`${analyticsUrl}/pixel.gif`} />
					</noscript>
					<script defer src={`${analyticsUrl}/script.js`}></script>
				</>
			)}

			<Header />
			<Outlet />
			<GlobalModal />
			{/* <TanStackRouterDevtools /> */}
		</>
	),
});
