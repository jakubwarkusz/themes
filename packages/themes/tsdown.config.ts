import { defineConfig } from "tsdown";
import { DECLARATION_BUILD_ENTRIES, RUNTIME_BUILD_ENTRIES } from "./build-entries.ts";

export default defineConfig({
	entry: [...RUNTIME_BUILD_ENTRIES],
	format: "esm",
	platform: "neutral",
	root: "src",
	fixedExtension: false,
	unbundle: true,
	minify: true,
	dts: { entry: [...DECLARATION_BUILD_ENTRIES] },
	deps: { neverBundle: [/^react(?:-dom)?(?:\/|$)/, /^next(?:\/|$)/] },
	env: { NODE_ENV: "production" },
});
