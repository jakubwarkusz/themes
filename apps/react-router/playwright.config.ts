import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	timeout: 60_000,
	use: {
		...devices["Desktop Chrome"],
		baseURL: "http://127.0.0.1:3139",
	},
	webServer: {
		command: "PORT=3139 bun run start",
		port: 3139,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
