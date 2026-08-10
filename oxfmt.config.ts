import { defineConfig, type OxfmtConfig } from "oxfmt";

export default defineConfig({
	arrowParens: "always",
	bracketSpacing: true,
	endOfLine: "lf",
	printWidth: 100,
	semi: true,
	singleQuote: false,
	tabWidth: 4,
	trailingComma: "all",
	useTabs: true,
	ignorePatterns: [
		"**/node_modules/**",
		"**/dist/**",
		"**/.next/**",
		"**/out/**",
		"**/coverage/**",
		"**/playwright-report/**",
		"**/test-results/**",
		"**/next-env.d.ts",
		"**/.source/**",
		"apps/docs/content/**",
		"bun.lock",
	],
} satisfies OxfmtConfig);
