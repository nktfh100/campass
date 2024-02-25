// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "@fontsource/rubik/hebrew-400.css";
import "@fontsource/rubik/hebrew-700.css";
import "@fontsource/rubik/latin-400.css";
import "@fontsource/rubik/latin-700.css";

import Header from "@/components/layout/Header/Header";
import GlobalModal from "@/components/shared/GlobalModal";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: () => (
		<>
			<Header />
			<Outlet />
			<GlobalModal />
			{/* <TanStackRouterDevtools /> */}
		</>
	),
});
