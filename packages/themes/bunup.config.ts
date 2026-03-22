import { defineConfig } from "bunup";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/client.ts",
		"src/next.ts",
		"src/providers/client-next-provider.tsx",
	],
	format: ["esm"],
	dts: true,
	external: ["next/headers"],
	env: { NODE_ENV: "production" },
});
