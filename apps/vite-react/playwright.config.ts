import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	timeout: 60_000,
	use: {
		...devices["Desktop Chrome"],
		baseURL: "http://127.0.0.1:3138",
	},
	webServer: {
		command: "bun run start",
		port: 3138,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
