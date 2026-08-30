import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
	ExtendedNextThemeProviderProps,
	ExtendedThemeProviderProps,
} from "../core/extended-types.js";
import type { ThemeProviderProps } from "../core/types.js";

const repositoryRoot = resolve(import.meta.dir, "../../../..");

type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;

function expectType<T>(_value: T): void {}

describe("support metadata", () => {
	test("keeps the React peer minimum aligned with public requirements", () => {
		const packageJson = JSON.parse(
			readFileSync(resolve(repositoryRoot, "packages/themes/package.json"), "utf-8"),
		) as { peerDependencies: { react: string; "react-dom": string } };
		expect(packageJson.peerDependencies.react).toBe("^18.0.0 || ^19.0.0");
		expect(packageJson.peerDependencies["react-dom"]).toBe("^18.0.0 || ^19.0.0");

		for (const path of [
			"README.md",
			"apps/docs/content/docs/index.mdx",
			".github/ISSUE_TEMPLATE/framework_support.yml",
			"CONTRIBUTING.md",
		]) {
			expect(readFileSync(resolve(repositoryRoot, path), "utf-8")).toContain("React 18+");
		}

		expect(readFileSync(resolve(repositoryRoot, "AGENTS.md"), "utf-8")).toContain(
			"React/React DOM 18",
		);
	});

	test("keeps extended props off the default ThemeProvider contract", () => {
		const typesSource = readFileSync(
			resolve(repositoryRoot, "packages/themes/src/core/types.ts"),
			"utf-8",
		);
		const extendedTypesSource = readFileSync(
			resolve(repositoryRoot, "packages/themes/src/core/extended-types.ts"),
			"utf-8",
		);
		const defaultProps = typesSource.slice(
			typesSource.indexOf("export type ThemeProviderProps"),
			typesSource.indexOf("export type ThemeContextValue"),
		);

		expect(defaultProps).not.toContain("systemThemeMap");
		expect(defaultProps).not.toContain("themeRoot");
		expect(extendedTypesSource).toContain("systemThemeMap?:");
		expect(extendedTypesSource).toContain("themeRoot?:");
		expect(extendedTypesSource).toMatch(
			/Omit<\s*ExtendedThemeProviderProps<Themes>,\s*"themeRoot"\s*>/,
		);

		expectType<HasKey<ThemeProviderProps, "systemThemeMap">>(false);
		expectType<HasKey<ThemeProviderProps, "themeRoot">>(false);
		expectType<HasKey<ExtendedThemeProviderProps, "systemThemeMap">>(true);
		expectType<HasKey<ExtendedThemeProviderProps, "themeRoot">>(true);
		expectType<HasKey<ExtendedNextThemeProviderProps, "systemThemeMap">>(true);
		expectType<HasKey<ExtendedNextThemeProviderProps, "themeRoot">>(false);
	});
});
