import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { applyThemeToDom } from "../core/client-dom.js";
import { getScript } from "../core/script.js";
import { resolveDefaultTheme } from "../core/theme-validation.js";
import type { Attribute, ThemeProviderProps } from "../core/types.js";
import { ClientThemeProvider } from "../providers/client-provider.js";

type ParityCase = {
	name: string;
	themes: string[];
	attribute: Attribute | readonly Attribute[];
	defaultTheme?: string;
	enableSystem: boolean;
	stored?: string;
	initialTheme?: string;
	forcedTheme?: string;
	value?: Record<string, string>;
	expected: string;
	themeColor?: Record<string, string>;
};

const cases: ParityCase[] = [
	{
		name: "mapped multi-class storage",
		themes: ["light", "dark"],
		attribute: ["class", "data-theme"],
		enableSystem: false,
		stored: "dark",
		value: { dark: "dark dark-palette" },
		expected: "dark",
		themeColor: { dark: "#000" },
	},
	{
		name: "invalid storage and explicit default",
		themes: ["paper", "midnight"],
		attribute: "data-theme",
		enableSystem: false,
		stored: "invalid",
		defaultTheme: "invalid",
		expected: "paper",
	},
	{
		name: "forced over initial and storage",
		themes: ["light", "dark"],
		attribute: "class",
		enableSystem: false,
		stored: "light",
		initialTheme: "light",
		forcedTheme: "dark",
		expected: "dark",
	},
];

function resetDom(): void {
	cleanup();
	localStorage.clear();
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");
	for (const meta of Array.from(document.querySelectorAll('meta[name="theme-color"]'))) {
		meta.remove();
	}
}

function readApplied(attribute: Attribute | readonly Attribute[]): string | null {
	const attributes = Array.isArray(attribute) ? attribute : [attribute];
	return attributes.includes("data-theme")
		? (document.documentElement.getAttribute("data-theme")?.split(" ")[0] ?? null)
		: document.documentElement.classList.item(0);
}

beforeEach(() => {
	window.matchMedia = () => ({ matches: false }) as MediaQueryList;
	resetDom();
});

afterEach(resetDom);

describe("bootstrap/runtime/provider parity", () => {
	for (const parityCase of cases) {
		test(parityCase.name, () => {
			const resolvedDefault = resolveDefaultTheme(
				parityCase.themes,
				parityCase.enableSystem,
				parityCase.defaultTheme,
			);
			const resolved =
				parityCase.forcedTheme ??
				parityCase.initialTheme ??
				(parityCase.stored && parityCase.themes.includes(parityCase.stored)
					? parityCase.stored
					: resolvedDefault);

			if (parityCase.stored) localStorage.setItem("theme", parityCase.stored);
			// biome-ignore lint/security/noGlobalEval: executes the generated bootstrap in the test DOM
			eval(
				getScript({
					storageKey: "theme",
					attribute: parityCase.attribute,
					defaultTheme: resolvedDefault,
					enableSystem: parityCase.enableSystem,
					enableColorScheme: true,
					forcedTheme: parityCase.forcedTheme,
					themes: parityCase.themes,
					value: parityCase.value,
					target: "html",
					storage: "localStorage",
					themeColors: parityCase.themeColor,
					initialTheme: parityCase.initialTheme,
					disableTransitionOnChange: true,
					followSystem: false,
					systemThemeMap: undefined,
				}),
			);
			expect(readApplied(parityCase.attribute)).toBe(parityCase.expected);

			resetDom();
			applyThemeToDom({
				resolved,
				attribute: parityCase.attribute,
				themes: parityCase.themes,
				valueMap: parityCase.value,
				target: "html",
				disableTransitionOnChange: true,
				enableColorScheme: true,
				themeColor: parityCase.themeColor,
				themeRoot: undefined,
				previous: undefined,
			});
			expect(readApplied(parityCase.attribute)).toBe(parityCase.expected);

			resetDom();
			if (parityCase.stored) localStorage.setItem("theme", parityCase.stored);
			const providerProps: Omit<ThemeProviderProps<string>, "children"> = {
				themes: parityCase.themes,
				attribute: parityCase.attribute,
				enableSystem: parityCase.enableSystem,
				...(parityCase.defaultTheme === undefined
					? {}
					: { defaultTheme: parityCase.defaultTheme }),
				...(parityCase.forcedTheme === undefined
					? {}
					: { forcedTheme: parityCase.forcedTheme }),
				...(parityCase.initialTheme === undefined
					? {}
					: { initialTheme: parityCase.initialTheme }),
				...(parityCase.value === undefined ? {} : { value: parityCase.value }),
				...(parityCase.themeColor === undefined
					? {}
					: { themeColor: parityCase.themeColor }),
			};
			render(
				<ClientThemeProvider<string> {...providerProps}>
					<span>content</span>
				</ClientThemeProvider>,
			);
			expect(readApplied(parityCase.attribute)).toBe(parityCase.expected);
		});
	}
});
