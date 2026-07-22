import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

	test("build config includes every client subpath entrypoint", () => {
		const config = readFileSync(resolve(rootDir, "bunup.config.ts"), "utf-8");

		for (const subpath of clientSubpaths) {
			expect(config).toContain(`"src/client/${subpath}.ts`);
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
		const config = readFileSync(resolve(rootDir, "bunup.config.ts"), "utf-8");
		const smoke = readFileSync(resolve(rootDir, "scripts/smoke-exports.ts"), "utf-8");

		for (const [subpath, exported] of Object.entries(packageJson.exports)) {
			if (subpath === "./package.json" || typeof exported === "string") continue;
			const runtimePath = exported.import?.default;
			const declarationPath = exported.import?.types;
			expect(runtimePath).toBeDefined();
			expect(declarationPath).toBeDefined();

			const sourceEntry = subpath === "." ? "src/index.ts" : `src/${subpath.slice(2)}.ts`;
			expect(config).toContain(`"${sourceEntry}"`);
			const importSpecifier =
				subpath === "." ? '"@wrksz/themes"' : `"@wrksz/themes/${subpath.slice(2)}"`;
			expect(smoke).toContain(importSpecifier);
		}
	});
});
