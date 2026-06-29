import { defineConfig } from "bunup";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/client.ts",
		"src/client/use-theme.ts",
		"src/client/use-theme-value.ts",
		"src/client/use-theme-effect.ts",
		"src/client/themed-image.ts",
		"src/client/provider.ts",
		"src/client/create-themes.ts",
		"src/next.ts",
		"src/providers/client-next-provider.tsx",
	],
	format: ["esm"],
	target: "browser",
	sourceBase: "./src",
	dts: true,
	external: ["next/headers"],
	env: { NODE_ENV: "production" },
});
