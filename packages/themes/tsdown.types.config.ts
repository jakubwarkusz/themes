import { defineConfig } from "tsdown";
import { DECLARATION_BUILD_ENTRIES } from "./build-entries.ts";

export default defineConfig({
	entry: [...DECLARATION_BUILD_ENTRIES],
	format: "esm",
	platform: "neutral",
	root: "src",
	fixedExtension: false,
	clean: false,
	dts: { emitDtsOnly: true },
	outputOptions: {
		codeSplitting: { groups: [{ name: "shared-types.d", test: /\.d\.ts$/ }] },
	},
	deps: { neverBundle: [/^react(?:-dom)?(?:\/|$)/, /^next(?:\/|$)/] },
});
