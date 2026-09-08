import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
	test: {
		environment: "happy-dom",
		environmentOptions: { happyDOM: { url: "http://localhost/" } },
		setupFiles: ["../../packages/themes/src/__tests__/setup.ts"],
		include: ["src/**/*.test.{ts,tsx}"],
	},
});
