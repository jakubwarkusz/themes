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
});
