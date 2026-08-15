import { beforeEach, describe, expect, test } from "bun:test";
import { getExtendedScript } from "../core/extended-script.js";

const base = {
	storageKey: "theme",
	attribute: "class" as const,
	defaultTheme: "system",
	enableSystem: true,
	enableColorScheme: true,
	forcedTheme: undefined,
	themes: ["paper", "midnight"],
	value: undefined,
	target: "html",
	storage: "localStorage" as const,
	themeColors: undefined,
	initialTheme: undefined,
	disableTransitionOnChange: false,
	followSystem: false,
	systemThemeMap: { light: "paper", dark: "midnight" },
};

function runScript(config: Parameters<typeof getExtendedScript>[0]): void {
	// oxlint-disable-next-line no-eval -- intentional in test - runs inline theme script in happy-dom context
	eval(getExtendedScript(config));
}

beforeEach(() => {
	document.documentElement.className = "";
	localStorage.clear();
	window.matchMedia = () => ({ matches: false }) as MediaQueryList;
});

describe("extended theme script", () => {
	test("maps a system preference before hydration", () => {
		window.matchMedia = () => ({ matches: true }) as MediaQueryList;
		runScript(base);

		expect(document.documentElement.classList.contains("midnight")).toBe(true);
	});

	test("preserves a stored variant family before hydration", () => {
		localStorage.setItem("theme", "light-blue");
		window.matchMedia = () => ({ matches: true }) as MediaQueryList;
		runScript({
			...base,
			themes: ["light-red", "dark-red", "light-blue", "dark-blue"],
			systemThemeMap: {
				"light-red": { light: "light-red", dark: "dark-red" },
				"dark-red": { light: "light-red", dark: "dark-red" },
				"light-blue": { light: "light-blue", dark: "dark-blue" },
				"dark-blue": { light: "light-blue", dark: "dark-blue" },
			},
		});

		expect(document.documentElement.classList.contains("dark-blue")).toBe(true);
	});

	test("escapes values that could close the script element", () => {
		expect(
			getExtendedScript({
				...base,
				systemThemeMap: { light: "</script>", dark: "midnight" },
			}),
		).not.toContain("</script>");
	});
});
