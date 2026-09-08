import { describe, expect, test } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getScript } from "../core/script.js";
import { THEME_SCRIPT_SOURCE } from "../core/script-source.js";

const rootDir = resolve(import.meta.dirname, "../..");

const base = {
	storageKey: "theme",
	attribute: "class" as const,
	defaultTheme: "system",
	enableSystem: true,
	enableColorScheme: true,
	forcedTheme: undefined,
	themes: ["light", "dark"],
	value: undefined,
	target: "html",
	storage: "localStorage" as const,
	themeColors: undefined,
	initialTheme: undefined,
	disableTransitionOnChange: false,
	followSystem: false,
};

describe("script-source generation", () => {
	test("ships generated source derived from the readable bootstrap", () => {
		expect(THEME_SCRIPT_SOURCE.startsWith("function(")).toBe(true);
		expect(THEME_SCRIPT_SOURCE).not.toContain("__name");
		expect(THEME_SCRIPT_SOURCE).toContain("prefers-color-scheme");
	});

	test("snapshot of default bootstrap output stays reviewable", () => {
		expect(getScript(base)).toMatchSnapshot();
	});

	test("generated script sources stay in sync with readable bootstraps", async () => {
		const result = spawnSync(
			process.execPath,
			["--import", "tsx", "scripts/generate-script-source.ts", "--check"],
			{
				cwd: rootDir,
				encoding: "utf8",
			},
		);

		expect(result.status).toBe(0);
		expect(result.stderr).toBe("");
	});

	test("generated storage range points at the cookie/hybrid parser", () => {
		const generator = readFileSync(resolve(rootDir, "src/core/script.ts"), "utf8");
		const offsets = generator.match(/S\.slice\(0,\s*(\d+)\)\s*\+\s*S\.slice\((\d+)\)/);
		expect(offsets).not.toBeNull();
		const cookie = Number(offsets?.[1]);
		const catchEnd = Number(offsets?.[2]);
		expect(cookie).toBeGreaterThan(0);
		expect(catchEnd).toBeGreaterThan(cookie);
		expect(THEME_SCRIPT_SOURCE.slice(cookie, catchEnd)).toContain("document.cookie");
		expect(THEME_SCRIPT_SOURCE.slice(cookie, catchEnd)).toContain("decodeURIComponent");
	});

	test("script entry re-exports getScript and ThemeScript", () => {
		const entry = readFileSync(resolve(rootDir, "src/script.ts"), "utf-8");
		expect(entry).toContain("export const getScript");
		expect(entry).toContain("export const ThemeScript");
	});
});
