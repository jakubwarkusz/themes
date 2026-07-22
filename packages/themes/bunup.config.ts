import { defineConfig } from "bunup";
import { DECLARATION_BUILD_ENTRIES, RUNTIME_BUILD_ENTRIES } from "./build-entries.js";

export default defineConfig({
	entry: RUNTIME_BUILD_ENTRIES,
	format: ["esm"],
	splitting: true,
	target: "browser",
	sourceBase: "./src",
	dts: {
		entry: DECLARATION_BUILD_ENTRIES,
		splitting: true,
	},
	external: ["next/headers"],
	env: { NODE_ENV: "production" },
});
