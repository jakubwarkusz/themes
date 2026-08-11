import { defineConfig, type OxlintConfig } from "oxlint";

export default defineConfig({
	plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "react", "jsx-a11y"],
	env: {
		browser: true,
		node: true,
	},
	categories: {
		correctness: "error",
		suspicious: "error",
		perf: "off",
	},
	rules: {
		"eslint/no-debugger": "error",
		"eslint/no-unused-vars": "error",
		"eslint/prefer-const": "error",
		"eslint/no-duplicate-imports": [
			"error",
			{
				allowSeparateTypeImports: true,
			},
		],
		"eslint/no-shadow": "off",
		"eslint/no-underscore-dangle": "off",
		"import/no-unassigned-import": "off",
		"react/react-in-jsx-scope": "off",
		"react/exhaustive-deps": "error",
		"react/rules-of-hooks": "error",
		"typescript/consistent-type-imports": "error",
		"typescript/no-explicit-any": "error",
	},
	overrides: [
		{
			files: ["**/*.{test,spec}.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
			rules: {
				"unicorn/consistent-function-scoping": "off",
			},
		},
	],
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
	],
}) satisfies OxlintConfig;
