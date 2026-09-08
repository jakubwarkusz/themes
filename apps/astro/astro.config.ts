import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [react()],
	output: "static",
	trailingSlash: "never",
	build: {
		format: "file",
	},
});
