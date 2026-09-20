import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
	ExtendedNextThemeProviderProps,
	ExtendedThemeProviderProps,
} from "../core/extended-types.js";
import type { ThemeProviderProps } from "../core/types.js";

const repositoryRoot = resolve(import.meta.dirname, "../../../..");

type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;

function expectType<T>(_value: T): void {}

describe("support metadata", () => {
	test("keeps the React peer minimum aligned with public requirements", () => {
		const packageJson = JSON.parse(
			readFileSync(resolve(repositoryRoot, "packages/themes/package.json"), "utf-8"),
		) as { peerDependencies: { react: string; "react-dom": string } };
		expect(packageJson.peerDependencies.react).toBe("^18.0.0 || ^19.0.0");
		expect(packageJson.peerDependencies["react-dom"]).toBe("^18.0.0 || ^19.0.0");

		for (const [path, requirement] of [
			["README.md", "React 18 or 19"],
			["packages/themes/README.md", "React and React DOM 18 or 19"],
			["apps/docs/content/docs/index.mdx", "React 18+"],
			[".github/ISSUE_TEMPLATE/framework_support.yml", "React 18+"],
			["CONTRIBUTING.md", "React 18+"],
		] as const) {
			const content = readFileSync(resolve(repositoryRoot, path), "utf-8");
			expect(content.includes(requirement), `${path} must document ${requirement}`).toBe(
				true,
			);
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
