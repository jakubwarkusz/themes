import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getScript } from "../core/script.js";
import { THEME_SCRIPT_SOURCE } from "../core/script-source.js";

const rootDir = resolve(import.meta.dir, "../..");

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
		const result = Bun.spawnSync({
			cmd: ["bun", "scripts/generate-script-source.ts", "--check"],
			cwd: rootDir,
			stdout: "pipe",
			stderr: "pipe",
		});

		expect(result.exitCode).toBe(0);
		expect(new TextDecoder().decode(result.stderr)).toBe("");
	});

	test("generated storage range points at the cookie/hybrid parser", () => {
		const cookie = THEME_SCRIPT_SOURCE.indexOf(';else if(o==="cookie"');
		const catchEnd = THEME_SCRIPT_SOURCE.indexOf("}catch{}s=");
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
