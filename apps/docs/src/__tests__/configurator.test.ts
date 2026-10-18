import { describe, expect, test } from "vitest";
import { type Config, DEFAULT_CONFIG, generate } from "../lib/configurator";

const files = (patch: Partial<Config> = {}) =>
	Object.fromEntries(
		generate({ ...DEFAULT_CONFIG, ...patch }).map((file) => [file.path, file.code]),
	);

describe("configurator", () => {
	test("defaults stay minimal", () => {
		const layout = files()["app/layout.tsx"];
		expect(layout).toContain('import { ThemeProvider } from "@wrksz/themes/next";');
		expect(layout).toContain(
			"<ThemeProvider disableTransitionOnChange>{children}</ThemeProvider>",
		);
		expect(layout).not.toContain("themes=");
	});

	test("server theme needs cookie storage", () => {
		expect(files({ serverTheme: true })["app/layout.tsx"]).not.toContain("getTheme");

		const layout = files({ serverTheme: true, storage: "hybrid" })["app/layout.tsx"];
		expect(layout).toContain('import { getTheme, ThemeProvider } from "@wrksz/themes/next";');
		expect(layout).toContain("export const instant = false;");
		expect(layout).toContain("const theme = await getTheme({ themes });");
		expect(layout).toContain("initialTheme={theme}");
		expect(layout).toContain('className={theme === "system" ? undefined : theme}');
	});

	test("extended props switch the entry point", () => {
		const layout = files({ sameDocumentSync: true })["app/layout.tsx"];
		expect(layout).toContain('from "@wrksz/themes/next/extended"');
		expect(layout).toContain("enableSameDocumentSync");

		expect(files({ sameDocumentSync: true, storage: "none" })["app/layout.tsx"]).toContain(
			'from "@wrksz/themes/next";',
		);
	});

	test("typed factory keeps themes in a server-safe module", () => {
		const output = files({ factory: true, storage: "cookie", serverTheme: true });
		expect(output["app/themes.ts"]).toContain(
			'export const themes = ["light", "dark"] as const;',
		);
		expect(output["app/theme.ts"]).toContain('"use client";');
		expect(output["app/theme.ts"]).toContain("\tthemes,\n");
		expect(output["app/layout.tsx"]).toContain('import { themes } from "./themes";');
		expect(output["components/theme-switch.tsx"]).toContain('from "@/app/theme"');
	});

	test("other SSR frameworks share one config between script and provider", () => {
		const output = files({ framework: "ssr", storage: "cookie", cookieDomain: "example.com" });
		expect(output["app/root.tsx"]).toContain("<ThemeScript {...themeConfig} />");
		expect(output["app/root.tsx"]).toContain('cookieOptions={{ domain: "example.com" }}');
		expect(output["app/theme-config.ts"]).not.toContain("cookieOptions");
	});

	test("tailwind variants follow attribute and value mapping", () => {
		const css = files({
			themes: ["light", "dark", "dim"],
			attribute: "data-theme",
			values: { dim: "dimmed" },
		})["app/globals.css"];
		expect(css).toContain(
			'@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));',
		);
		expect(css).toContain(
			'@custom-variant dim (&:where([data-theme="dimmed"], [data-theme="dimmed"] *));',
		);
	});

	test("invalid choices fall back to valid props", () => {
		const layout = files({ enableSystem: false, defaultTheme: "system", forcedTheme: "sepia" })[
			"app/layout.tsx"
		];
		expect(layout).toContain("enableSystem={false}");
		expect(layout).not.toContain("defaultTheme");
		expect(layout).not.toContain("forcedTheme");
	});
});
