import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getScript } from "../script.js";

beforeEach(() => {
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");
	document.documentElement.style.colorScheme = "";
	for (const el of Array.from(document.head.querySelectorAll('meta[name="theme-color"]'))) {
		el.remove();
	}
	localStorage.clear();
	sessionStorage.clear();
});

afterEach(() => {
	localStorage.clear();
	sessionStorage.clear();
});

function runScript(config: Parameters<typeof getScript>[0]): void {
	// biome-ignore lint/security/noGlobalEval: intentional in test - runs inline theme script in happy-dom context
	eval(getScript(config));
}

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
};

describe("themeScript - class attribute", () => {
	test("applies dark class when system prefers dark", () => {
		window.matchMedia = () => ({ matches: true }) as MediaQueryList;
		runScript(base);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("applies light class when system prefers light", () => {
		window.matchMedia = () => ({ matches: false }) as MediaQueryList;
		runScript(base);
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});

	test("reads theme from localStorage", () => {
		localStorage.setItem("theme", "dark");
		runScript(base);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("ignores invalid localStorage value", () => {
		localStorage.setItem("theme", "hacked");
		window.matchMedia = () => ({ matches: false }) as MediaQueryList;
		runScript(base);
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});

	test("forcedTheme overrides localStorage", () => {
		localStorage.setItem("theme", "light");
		runScript({ ...base, forcedTheme: "dark" });
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("light")).toBe(false);
	});

	test("removes previous theme class before adding new one", () => {
		document.documentElement.classList.add("light");
		localStorage.setItem("theme", "dark");
		runScript(base);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("light")).toBe(false);
	});

	test("uses defaultTheme when storage is empty", () => {
		runScript({ ...base, enableSystem: false, defaultTheme: "dark" });
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});
});

describe("themeScript - data attribute", () => {
	test("sets data-theme attribute", () => {
		localStorage.setItem("theme", "dark");
		runScript({ ...base, attribute: "data-theme" });
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	test("sets multiple attributes", () => {
		localStorage.setItem("theme", "dark");
		runScript({ ...base, attribute: ["class", "data-theme"] });
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});
});

describe("themeScript - value map", () => {
	test("maps theme to custom value", () => {
		localStorage.setItem("theme", "dark");
		runScript({ ...base, value: { dark: "dark-mode", light: "light-mode" } });
		expect(document.documentElement.classList.contains("dark-mode")).toBe(true);
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});
});

describe("themeScript - colorScheme", () => {
	test("sets colorScheme for light theme", () => {
		localStorage.setItem("theme", "light");
		runScript(base);
		expect(document.documentElement.style.colorScheme).toBe("light");
	});

	test("sets colorScheme for dark theme", () => {
		localStorage.setItem("theme", "dark");
		runScript(base);
		expect(document.documentElement.style.colorScheme).toBe("dark");
	});

	test("does not set colorScheme when disabled", () => {
		localStorage.setItem("theme", "dark");
		runScript({ ...base, enableColorScheme: false });
		expect(document.documentElement.style.colorScheme).toBe("");
	});
});

describe("themeScript - storage options", () => {
	test("reads from sessionStorage", () => {
		sessionStorage.setItem("theme", "dark");
		runScript({ ...base, storage: "sessionStorage" });
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("ignores storage when storage=none", () => {
		localStorage.setItem("theme", "dark");
		runScript({ ...base, storage: "none", enableSystem: false, defaultTheme: "light" });
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});
});

describe("themeScript - #308 (from next-themes) enableSystem + defaultTheme", () => {
	test("defaultTheme is respected even when enableSystem=true and system is dark", () => {
		// system is dark, but defaultTheme="light" - should apply light
		window.matchMedia = () => ({ matches: true }) as MediaQueryList;
		runScript({ ...base, enableSystem: true, defaultTheme: "light" });
		expect(document.documentElement.classList.contains("light")).toBe(true);
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});

	test("system preference is used when defaultTheme is not set and enableSystem=true", () => {
		window.matchMedia = () => ({ matches: true }) as MediaQueryList;
		runScript({ ...base, enableSystem: true, defaultTheme: "system" });
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("stored theme overrides defaultTheme regardless of enableSystem", () => {
		localStorage.setItem("theme", "dark");
		window.matchMedia = () => ({ matches: false }) as MediaQueryList;
		runScript({ ...base, enableSystem: true, defaultTheme: "light" });
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});
});

describe("themeScript - themeColor", () => {
	test("creates meta theme-color tag", () => {
		localStorage.setItem("theme", "dark");
		runScript({ ...base, themeColors: { light: "#fff", dark: "#000" } });
		const meta = document.querySelector('meta[name="theme-color"]');
		expect(meta).not.toBeNull();
		expect(meta?.getAttribute("content")).toBe("#000");
	});

	test("updates existing meta theme-color tag", () => {
		const meta = document.createElement("meta");
		meta.setAttribute("name", "theme-color");
		meta.setAttribute("content", "#fff");
		document.head.appendChild(meta);
		localStorage.setItem("theme", "dark");
		runScript({ ...base, themeColors: { light: "#fff", dark: "#000" } });
		expect(meta.getAttribute("content")).toBe("#000");
	});

	test("uses string themeColors for all themes", () => {
		localStorage.setItem("theme", "light");
		runScript({ ...base, themeColors: "var(--bg)" });
		const meta = document.querySelector('meta[name="theme-color"]');
		expect(meta?.getAttribute("content")).toBe("var(--bg)");
	});
});

describe("themeScript - multiple classes via value map", () => {
	test("adds multiple classes when value contains space-separated tokens", () => {
		localStorage.setItem("theme", "dark");
		runScript({
			...base,
			themes: ["light", "dark"],
			value: { light: "light", dark: "dark dark-palette" },
		});
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("dark-palette")).toBe(true);
	});

	test("removes all space-separated tokens on theme switch", () => {
		document.documentElement.classList.add("dark", "dark-palette");
		localStorage.setItem("theme", "light");
		runScript({
			...base,
			themes: ["light", "dark"],
			value: { light: "light", dark: "dark dark-palette" },
		});
		expect(document.documentElement.classList.contains("dark")).toBe(false);
		expect(document.documentElement.classList.contains("dark-palette")).toBe(false);
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});
});
