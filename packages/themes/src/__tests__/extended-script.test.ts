import { beforeEach, describe, expect, test } from "bun:test";
import { applyExtendedThemeToDom } from "../core/extended-client-dom.js";
import { getExtendedScript } from "../core/extended-script.js";
import { EXTENDED_THEME_SCRIPT_SOURCE } from "../core/extended-script-source.js";
import { clearCookies } from "./setup.js";

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
	document.documentElement.removeAttribute("data-theme");
	document.documentElement.style.colorScheme = "";
	document.querySelector('meta[name="theme-color"]')?.remove();
	localStorage.clear();
	clearCookies();
	window.matchMedia = () => ({ matches: false }) as MediaQueryList;
});

describe("extended theme script", () => {
	test("uses deterministic generated source instead of runtime function serialization", () => {
		const script = getExtendedScript(base);

		expect(EXTENDED_THEME_SCRIPT_SOURCE.startsWith("function(")).toBe(true);
		expect(script).toMatch(/^\(function\(/);
		expect(script).not.toContain("extendedThemeScript");
		expect(script).not.toContain("__name");
		expect(script).toBe(getExtendedScript(base));
	});

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

	test("does not query matchMedia when system resolution is unnecessary", () => {
		let queried = false;
		window.matchMedia = () => {
			queried = true;
			return { matches: true } as MediaQueryList;
		};
		runScript({ ...base, enableSystem: false, defaultTheme: "paper" });

		expect(queried).toBe(false);
		expect(document.documentElement.classList.contains("paper")).toBe(true);
	});

	test("falls back to defaultTheme when system is selected but disabled", () => {
		localStorage.setItem("theme", "system");
		runScript({ ...base, enableSystem: false, defaultTheme: "paper" });

		expect(document.documentElement.classList.contains("paper")).toBe(true);
	});

	test("matches direct DOM application for a mapped system theme", () => {
		window.matchMedia = () => ({ matches: true }) as MediaQueryList;
		const config = {
			...base,
			attribute: ["class", "data-theme"] as const,
			value: { paper: "paper surface", midnight: "midnight surface" },
			themeColors: { midnight: "#001" },
		};
		const snapshot = () => ({
			classes: Array.from(document.documentElement.classList).toSorted(),
			dataTheme: document.documentElement.getAttribute("data-theme"),
			colorScheme: document.documentElement.style.colorScheme,
			themeColor:
				document
					.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
					?.getAttribute("content") ?? null,
		});

		runScript(config);
		const bootstrapSnapshot = snapshot();

		document.documentElement.className = "";
		document.documentElement.removeAttribute("data-theme");
		document.documentElement.style.colorScheme = "";
		document.querySelector('meta[name="theme-color"]')?.remove();
		applyExtendedThemeToDom({
			resolved: "midnight",
			attribute: config.attribute,
			themes: config.themes,
			valueMap: config.value,
			target: config.target,
			disableTransitionOnChange: config.disableTransitionOnChange,
			enableColorScheme: config.enableColorScheme,
			themeColor: config.themeColors,
			previous: undefined,
		});

		expect(snapshot()).toEqual(bootstrapSnapshot);
	});

	test("snapshot of extended bootstrap output stays reviewable", () => {
		expect(getExtendedScript(base)).toMatchSnapshot();
	});

	test("empty mapped class value does not fall back to the theme name", () => {
		localStorage.setItem("theme", "paper");
		runScript({ ...base, value: { paper: "" }, enableSystem: false, defaultTheme: "paper" });
		expect(document.documentElement.classList.contains("paper")).toBe(false);
	});

	test("clears color-scheme when the resolved theme is not light or dark", () => {
		document.documentElement.style.colorScheme = "dark";
		runScript({ ...base, enableSystem: false, defaultTheme: "paper" });
		expect(document.documentElement.style.colorScheme).toBe("");
	});

	test("falls back to localStorage when a hybrid cookie is malformed", () => {
		localStorage.setItem("theme", "paper");
		document.cookie = "theme=%";
		runScript({ ...base, storage: "hybrid", enableSystem: false, defaultTheme: "midnight" });
		expect(document.documentElement.classList.contains("paper")).toBe(true);
	});
});
