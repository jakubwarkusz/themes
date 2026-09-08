import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { applyThemeToDom } from "../core/client-dom.js";
import { getScript } from "../core/script.js";
import { resolveDefaultTheme } from "../core/theme-validation.js";
import type { Attribute, ThemeProviderProps } from "../core/types.js";
import { ClientThemeProvider } from "../providers/client-provider.js";
import { clearCookies } from "./setup.js";

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
		name: "absent storage resolves the system preference",
		themes: ["light", "dark"],
		attribute: ["class", "data-theme"],
		enableSystem: true,
		themeColor: { dark: "#001" },
		enableColorScheme: true,
		disableTransitionOnChange: true,
		prefersDark: true,
		expected: {
			classes: ["dark"],
			dataTheme: "dark",
			colorScheme: "dark",
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
	{
		name: "empty mapped class value does not fall back to the theme name",
		themes: ["light", "dark"],
		attribute: "class",
		enableSystem: false,
		storedTheme: "dark",
		value: { dark: "" },
		enableColorScheme: false,
		disableTransitionOnChange: noTransition,
		prefersDark: false,
		expected: {
			classes: [],
			dataTheme: null,
			colorScheme: "",
			themeColor: null,
			transitionStyle: null,
		},
	},
	{
		name: "empty mapped data attribute is removed",
		themes: ["light", "dark"],
		attribute: "data-theme",
		enableSystem: false,
		storedTheme: "dark",
		value: { dark: "" },
		enableColorScheme: false,
		disableTransitionOnChange: noTransition,
		prefersDark: false,
		expected: {
			classes: [],
			dataTheme: null,
			colorScheme: "",
			themeColor: null,
			transitionStyle: null,
		},
	},
	{
		name: "custom theme does not set color-scheme",
		themes: ["light", "dark", "high-contrast"],
		attribute: "class",
		enableSystem: false,
		storedTheme: "high-contrast",
		enableColorScheme: true,
		disableTransitionOnChange: noTransition,
		prefersDark: false,
		expected: {
			classes: ["high-contrast"],
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
	sessionStorage.clear();
	clearCookies();
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");
	document.documentElement.style.colorScheme = "";
	document.body.className = "";
	document.body.removeAttribute("data-theme");
	document.body.style.colorScheme = "";
	for (const element of Array.from(
		document.querySelectorAll('meta[name="theme-color"], style, #fixture'),
	)) {
		element.remove();
	}
	if (parityCase?.storedTheme !== undefined) {
		localStorage.setItem("theme", parityCase.storedTheme);
	}
}

const applyOptions = {
	attribute: "class" as const,
	themes: ["light", "dark", "high-contrast"],
	valueMap: undefined,
	target: "html",
	disableTransitionOnChange: false,
	enableColorScheme: true,
	themeColor: { dark: "#000" } as Record<string, string> | undefined,
};

function runGeneratedScript(config: Parameters<typeof getScript>[0]): void {
	// oxlint-disable-next-line no-eval -- executes the generated bootstrap in the test DOM
	eval(getScript(config));
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
		classes: Array.from(document.documentElement.classList).toSorted(),
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
	return selection === "system" ? systemTheme : selection;
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
	};
}

beforeEach(() => {
	// Flush transition-disable style cleanup synchronously so later suites are not
	// hit by happy-dom removeChild errors from pending requestAnimationFrame work.
	const flushFrame = ((callback: FrameRequestCallback) => {
		callback(0);
		return 0;
	}) as typeof requestAnimationFrame;
	globalThis.requestAnimationFrame = flushFrame;
	window.requestAnimationFrame = flushFrame;
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
				// oxlint-disable-next-line no-eval -- executes the generated bootstrap in the test DOM
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

describe("bootstrap/runtime sequential apply", () => {
	const scriptBase = {
		storageKey: "theme",
		attribute: "class" as const,
		defaultTheme: "light",
		enableSystem: false,
		enableColorScheme: true,
		forcedTheme: undefined,
		themes: ["light", "dark", "high-contrast"],
		value: undefined,
		target: "html",
		storage: "localStorage" as const,
		themeColors: { dark: "#000" } as Record<string, string> | undefined,
		initialTheme: undefined,
		disableTransitionOnChange: false,
		followSystem: false,
	};

	test("clears color-scheme when switching from dark to a custom theme", () => {
		applyThemeToDom({ ...applyOptions, resolved: "dark" });
		expect(document.documentElement.style.colorScheme).toBe("dark");
		applyThemeToDom({ ...applyOptions, resolved: "high-contrast" });
		expect(document.documentElement.style.colorScheme).toBe("");

		resetDom();
		localStorage.setItem("theme", "dark");
		runGeneratedScript(scriptBase);
		expect(document.documentElement.style.colorScheme).toBe("dark");
		localStorage.setItem("theme", "high-contrast");
		runGeneratedScript(scriptBase);
		expect(document.documentElement.style.colorScheme).toBe("");
	});

	test("restores theme-color when the next theme has no mapped color", () => {
		applyThemeToDom({ ...applyOptions, resolved: "dark", themeColor: { dark: "#000" } });
		expect(document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content).toBe(
			"#000",
		);
		applyThemeToDom({ ...applyOptions, resolved: "light", themeColor: { dark: "#000" } });
		expect(document.querySelector('meta[name="theme-color"]')).toBeNull();
	});

	test("removes stale class tokens when the value map remaps", () => {
		applyThemeToDom({
			...applyOptions,
			themes: ["light", "dark"],
			resolved: "dark",
			enableColorScheme: false,
			themeColor: undefined,
			valueMap: { dark: "dark-one" },
		});
		expect(document.documentElement.classList.contains("dark-one")).toBe(true);

		applyThemeToDom({
			...applyOptions,
			themes: ["light", "dark"],
			resolved: "dark",
			enableColorScheme: false,
			themeColor: undefined,
			valueMap: { dark: "dark-two" },
		});
		expect(document.documentElement.classList.contains("dark-two")).toBe(true);
		expect(document.documentElement.classList.contains("dark-one")).toBe(false);
	});

	test("hybrid storage falls back to localStorage when the cookie is malformed", () => {
		localStorage.setItem("theme", "dark");
		document.cookie = "theme=%";

		runGeneratedScript({ ...scriptBase, storage: "hybrid", themes: ["light", "dark"] });
		expect(document.documentElement.classList.contains("dark")).toBe(true);

		resetDom();
		localStorage.setItem("theme", "dark");
		document.cookie = "theme=%";
		const view = render(
			<ClientThemeProvider storage="hybrid" enableSystem={false} defaultTheme="light">
				<span>content</span>
			</ClientThemeProvider>,
		);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		view.unmount();
	});

	test("applies to body and a selector target", () => {
		applyThemeToDom({ ...applyOptions, resolved: "dark", target: "body" });
		expect(document.body.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("dark")).toBe(false);

		const fixture = document.createElement("div");
		fixture.id = "fixture";
		document.body.appendChild(fixture);
		applyThemeToDom({ ...applyOptions, resolved: "dark", target: "#fixture" });
		expect(fixture.classList.contains("dark")).toBe(true);

		resetDom();
		localStorage.setItem("theme", "dark");
		runGeneratedScript({ ...scriptBase, target: "body", themes: ["light", "dark"] });
		expect(document.body.classList.contains("dark")).toBe(true);
	});
});
