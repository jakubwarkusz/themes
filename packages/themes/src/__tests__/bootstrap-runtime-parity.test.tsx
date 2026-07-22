import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { applyThemeToDom } from "../core/client-dom.js";
import { getScript } from "../core/script.js";
import { resolveDefaultTheme } from "../core/theme-validation.js";
import type { Attribute, SystemThemeMap, ThemeProviderProps } from "../core/types.js";
import { ClientThemeProvider } from "../providers/client-provider.js";

type DomSnapshot = {
	classes: string[];
	dataTheme: string | null;
	colorScheme: string;
	themeColor: string | null;
	transitionStyle: string | null;
};

type ParityCase = {
	name: string;
	themes: string[];
	attribute: Attribute | readonly Attribute[];
	enableSystem: boolean;
	defaultTheme?: string;
	storedTheme?: string;
	initialTheme?: string;
	forcedTheme?: string;
	value?: Record<string, string>;
	themeColor?: Record<string, string>;
	enableColorScheme: boolean;
	disableTransitionOnChange: boolean | string;
	systemThemeMap?: SystemThemeMap<string>;
	prefersDark: boolean;
	expected: DomSnapshot;
};

const noTransition = false;

const cases: ParityCase[] = [
	{
		name: "mapped multi-class storage with complete DOM side effects",
		themes: ["light", "dark"],
		attribute: ["class", "data-theme"],
		enableSystem: false,
		storedTheme: "dark",
		value: { dark: "dark dark-palette" },
		themeColor: { dark: "#000" },
		enableColorScheme: true,
		disableTransitionOnChange: "background-color 0s",
		prefersDark: false,
		expected: {
			classes: ["dark", "dark-palette"],
			dataTheme: "dark dark-palette",
			colorScheme: "dark",
			themeColor: "#000",
			transitionStyle: "*,*::before,*::after{transition:background-color 0s!important}",
		},
	},
	{
		name: "absent storage resolves a custom system map",
		themes: ["paper", "midnight"],
		attribute: ["class", "data-theme"],
		enableSystem: true,
		systemThemeMap: { light: "paper", dark: "midnight" },
		themeColor: { midnight: "#001" },
		enableColorScheme: true,
		disableTransitionOnChange: true,
		prefersDark: true,
		expected: {
			classes: ["midnight"],
			dataTheme: "midnight",
			colorScheme: "",
			themeColor: "#001",
			transitionStyle: "*,*::before,*::after{transition:none!important}",
		},
	},
	{
		name: "invalid storage and default fall back to the first custom theme",
		themes: ["paper", "midnight"],
		attribute: "data-theme",
		enableSystem: false,
		storedTheme: "invalid",
		defaultTheme: "invalid",
		enableColorScheme: true,
		disableTransitionOnChange: noTransition,
		prefersDark: false,
		expected: {
			classes: [],
			dataTheme: "paper",
			colorScheme: "",
			themeColor: null,
			transitionStyle: null,
		},
	},
	{
		name: "forced theme wins over initial and stored selections",
		themes: ["light", "dark"],
		attribute: "class",
		enableSystem: false,
		storedTheme: "light",
		initialTheme: "light",
		forcedTheme: "dark",
		enableColorScheme: true,
		disableTransitionOnChange: noTransition,
		prefersDark: false,
		expected: {
			classes: ["dark"],
			dataTheme: null,
			colorScheme: "dark",
			themeColor: null,
			transitionStyle: null,
		},
	},
	{
		name: "absent storage and disabled system use the first theme",
		themes: ["paper", "midnight"],
		attribute: "class",
		enableSystem: false,
		enableColorScheme: false,
		disableTransitionOnChange: noTransition,
		prefersDark: true,
		expected: {
			classes: ["paper"],
			dataTheme: null,
			colorScheme: "",
			themeColor: null,
			transitionStyle: null,
		},
	},
];

function resetDom(parityCase?: ParityCase): void {
	cleanup();
	localStorage.clear();
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");
	document.documentElement.style.colorScheme = "";
	for (const element of Array.from(
		document.querySelectorAll('meta[name="theme-color"], style'),
	)) {
		element.remove();
	}
	if (parityCase?.storedTheme !== undefined) {
		localStorage.setItem("theme", parityCase.storedTheme);
	}
}

function captureDom(run: () => void): DomSnapshot {
	let transitionStyle: string | null = null;
	const appendChild = document.head.appendChild.bind(document.head);
	document.head.appendChild = <NodeType extends Node>(node: NodeType): NodeType => {
		if ((node as unknown as Element).tagName === "STYLE") {
			transitionStyle = (node as unknown as Element).textContent;
		}
		return appendChild(node) as NodeType;
	};

	try {
		run();
	} finally {
		document.head.appendChild = appendChild;
	}

	return {
		classes: Array.from(document.documentElement.classList).sort(),
		dataTheme: document.documentElement.getAttribute("data-theme"),
		colorScheme: document.documentElement.style.colorScheme,
		themeColor:
			document
				.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
				?.getAttribute("content") ?? null,
		transitionStyle,
	};
}

function isValidSelection(selection: string, parityCase: ParityCase): boolean {
	return selection === "system" ? parityCase.enableSystem : parityCase.themes.includes(selection);
}

function resolveCase(parityCase: ParityCase): string {
	const defaultTheme = resolveDefaultTheme(
		parityCase.themes,
		parityCase.enableSystem,
		parityCase.defaultTheme,
	);
	const selection =
		(parityCase.forcedTheme && parityCase.themes.includes(parityCase.forcedTheme)
			? parityCase.forcedTheme
			: undefined) ??
		(parityCase.initialTheme && isValidSelection(parityCase.initialTheme, parityCase)
			? parityCase.initialTheme
			: undefined) ??
		(parityCase.storedTheme && isValidSelection(parityCase.storedTheme, parityCase)
			? parityCase.storedTheme
			: defaultTheme);
	const systemTheme = parityCase.prefersDark ? "dark" : "light";
	const map = parityCase.systemThemeMap;
	if (!map) return selection === "system" ? systemTheme : selection;
	const directMap = map as { light?: unknown; dark?: unknown };
	if (typeof directMap.light === "string" && typeof directMap.dark === "string") {
		if (selection !== "system") return selection;
		return systemTheme === "dark" ? directMap.dark : directMap.light;
	}
	const variants = map as Partial<Record<string, { light: string; dark: string }>>;
	return variants[selection]?.[systemTheme] ?? (selection === "system" ? systemTheme : selection);
}

function getProviderProps(parityCase: ParityCase): Omit<ThemeProviderProps<string>, "children"> {
	return {
		themes: parityCase.themes,
		attribute: parityCase.attribute,
		enableSystem: parityCase.enableSystem,
		enableColorScheme: parityCase.enableColorScheme,
		disableTransitionOnChange: parityCase.disableTransitionOnChange,
		storage: "localStorage",
		...(parityCase.defaultTheme === undefined ? {} : { defaultTheme: parityCase.defaultTheme }),
		...(parityCase.forcedTheme === undefined ? {} : { forcedTheme: parityCase.forcedTheme }),
		...(parityCase.initialTheme === undefined ? {} : { initialTheme: parityCase.initialTheme }),
		...(parityCase.value === undefined ? {} : { value: parityCase.value }),
		...(parityCase.themeColor === undefined ? {} : { themeColor: parityCase.themeColor }),
		...(parityCase.systemThemeMap === undefined
			? {}
			: { systemThemeMap: parityCase.systemThemeMap }),
	};
}

beforeEach(() => {
	resetDom();
});

afterEach(() => {
	resetDom();
});

describe("bootstrap/runtime/provider parity", () => {
	for (const parityCase of cases) {
		test(parityCase.name, () => {
			window.matchMedia = () => ({ matches: parityCase.prefersDark }) as MediaQueryList;
			const defaultTheme = resolveDefaultTheme(
				parityCase.themes,
				parityCase.enableSystem,
				parityCase.defaultTheme,
			);

			resetDom(parityCase);
			const scriptSnapshot = captureDom(() => {
				// biome-ignore lint/security/noGlobalEval: executes the generated bootstrap in the test DOM
				eval(
					getScript({
						storageKey: "theme",
						attribute: parityCase.attribute,
						defaultTheme,
						enableSystem: parityCase.enableSystem,
						enableColorScheme: parityCase.enableColorScheme,
						forcedTheme: parityCase.forcedTheme,
						themes: parityCase.themes,
						value: parityCase.value,
						target: "html",
						storage: "localStorage",
						themeColors: parityCase.themeColor,
						initialTheme: parityCase.initialTheme,
						disableTransitionOnChange: parityCase.disableTransitionOnChange,
						followSystem: false,
						systemThemeMap: parityCase.systemThemeMap,
					}),
				);
			});

			resetDom(parityCase);
			const directDomSnapshot = captureDom(() => {
				applyThemeToDom({
					resolved: resolveCase(parityCase),
					attribute: parityCase.attribute,
					themes: parityCase.themes,
					valueMap: parityCase.value,
					target: "html",
					disableTransitionOnChange: parityCase.disableTransitionOnChange,
					enableColorScheme: parityCase.enableColorScheme,
					themeColor: parityCase.themeColor,
					themeRoot: undefined,
					previous: undefined,
				});
			});

			resetDom(parityCase);
			const providerSnapshot = captureDom(() => {
				render(
					<ClientThemeProvider<string> {...getProviderProps(parityCase)}>
						<span>content</span>
					</ClientThemeProvider>,
				);
			});

			expect(scriptSnapshot).toEqual(parityCase.expected);
			expect(directDomSnapshot).toEqual(parityCase.expected);
			expect(providerSnapshot).toEqual(parityCase.expected);
		});
	}
});
