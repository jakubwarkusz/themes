import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	DECLARATION_BUILD_ENTRIES,
	INTERNAL_RUNTIME_BUILD_ENTRIES,
	PUBLIC_BUILD_ENTRIES,
	RUNTIME_BUILD_ENTRIES,
} from "../../build-entries.js";

const rootDir = resolve(import.meta.dir, "../..");

const clientSubpaths = [
	"use-theme",
	"use-theme-value",
	"use-theme-effect",
	"use-hydrated",
	"themed-image",
	"provider",
	"create-themes",
] as const;

describe("client subpath exports", () => {
	test("package.json exposes fine-grained client modules", () => {
		const packageJson = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf-8")) as {
			exports: Record<string, { import?: { types?: string; default?: string } }>;
		};

		for (const subpath of clientSubpaths) {
			expect(packageJson.exports[`./client/${subpath}`]).toEqual({
				import: {
					types: `./dist/client/${subpath}.d.ts`,
					default: `./dist/client/${subpath}.js`,
				},
			});
		}
	});

	test("exposes the framework-neutral script entrypoint", () => {
		const packageJson = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf-8")) as {
			exports: Record<string, { import?: { types?: string; default?: string } }>;
		};
		expect(packageJson.exports["./script"]).toEqual({
			import: {
				types: "./dist/script.d.ts",
				default: "./dist/script.js",
			},
		});
	});

	test("keeps every public export in build, declaration, and smoke coverage", () => {
		const packageJson = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf-8")) as {
			exports: Record<string, { import?: { types?: string; default?: string } } | string>;
		};
		const smoke = readFileSync(resolve(rootDir, "scripts/smoke-exports.ts"), "utf-8");
		const publicSourceEntries: string[] = [];

		for (const [subpath, exported] of Object.entries(packageJson.exports)) {
			if (subpath === "./package.json" || typeof exported === "string") continue;
			const runtimePath = exported.import?.default;
			const declarationPath = exported.import?.types;
			expect(runtimePath).toBeDefined();
			expect(declarationPath).toBeDefined();

			const sourceEntry = subpath === "." ? "src/index.ts" : `src/${subpath.slice(2)}.ts`;
			publicSourceEntries.push(sourceEntry);
			const importSpecifier =
				subpath === "." ? '"@wrksz/themes"' : `"@wrksz/themes/${subpath.slice(2)}"`;
			expect(smoke).toContain(importSpecifier);
		}

		const publicEntries: string[] = [...PUBLIC_BUILD_ENTRIES];
		const declarationEntries: string[] = [...DECLARATION_BUILD_ENTRIES];
		const runtimeEntries: string[] = [...RUNTIME_BUILD_ENTRIES];
		expect(publicEntries.sort()).toEqual(publicSourceEntries.sort());
		expect(declarationEntries.sort()).toEqual(publicSourceEntries.sort());
		expect([...INTERNAL_RUNTIME_BUILD_ENTRIES]).toEqual([
			"src/providers/client-next-provider.tsx",
		]);
		expect(runtimeEntries.sort()).toEqual(
			[...publicSourceEntries, ...INTERNAL_RUNTIME_BUILD_ENTRIES].sort(),
		);
	});
});
