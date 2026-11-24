import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	timeout: 60_000,
	use: {
		baseURL: "http://127.0.0.1:3137",
	},
	projects: [
		{ name: "chromium", use: devices["Desktop Chrome"] },
		{ name: "firefox", use: devices["Desktop Firefox"] },
		{ name: "webkit", use: devices["Desktop Safari"] },
	],
	webServer: {
		command: "pnpm start --port 3137",
		port: 3137,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
