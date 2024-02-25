import path from "path";
import { defineConfig } from "vite";

import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		cssTarget: "chrome61",
	},
	plugins: [
		react(),
		TanStackRouterVite(),
		// For production build environments only
		legacy({
			/**
			 * Expected compatible target browser version range
			 *
			 * The example here is in the configuration format of browserslist
			 * (https://github.com/browserslist/browserslist)
			 */
			targets: [
				"chrome >= 64",
				"edge >= 79",
				"safari >= 11.1",
				"firefox >= 67",
			],
			/**
			 * Whether to generate legacy browser compatibility chunks
			 *
			 * The examples here are only compatible with modern browsers, so it is not necessary to generate
			 */
			renderLegacyChunks: false,
			/**
			 * Polyfills required by modern browsers
			 *
			 * Since some low-version modern browsers do not support the new syntax
			 * You need to load polyfills corresponding to the syntax to be compatible
			 * At build, the required polyfills are packaged according to the target browser version range
			 *
			 * Two configuration methods:
			 *
			 * 1. true
			 *  - Auto detect required polyfills based on target browser version range
			 *  - Demerit: will introduce polyfills that are not needed by modern browsers in higher versions,
			 *    as well as more aggressive polyfills.
			 *
			 * 2. string[]
			 *  - Add low-version browser polyfills as needed
			 *  - Example: ['es/global-this', 'proposals/object-from-entries']
			 *  - Demerit: It needs to be added manually, which is inflexible;
			 *    it will be discovered after the production is deployed, resulting in production failure! ! !
			 */
			modernPolyfills: true,
		}),
	],
});
