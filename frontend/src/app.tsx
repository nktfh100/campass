import "./app.scss";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { NextUIProvider } from "@nextui-org/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
	ReactDOM.createRoot(rootElement).render(
		<StrictMode>
			<NextUIProvider className="light">
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
				</QueryClientProvider>
			</NextUIProvider>
		</StrictMode>
	);
}
