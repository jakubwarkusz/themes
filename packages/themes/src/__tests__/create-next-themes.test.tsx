import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import "./setup.js";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { clearCookies } from "./setup.js";

const insertedHtmlCallbacks: Array<() => ReactNode> = [];

mock.module("next/navigation", () => ({
	useServerInsertedHTML: (callback: () => ReactNode) => {
		insertedHtmlCallbacks.push(callback);
	},
}));

const { createThemes } = await import("../factory/create-next-themes.js");

const { NextThemeProvider, ThemeProvider, ThemeScript, useTheme } = createThemes({
	themes: ["light", "dark", "sepia"] as const,
	defaultTheme: "light",
	attribute: "class",
	storage: "none",
});

function ThemeReader() {
	const { theme, setTheme } = useTheme();
	return (
		<div>
			<span data-testid="theme">{theme ?? "-"}</span>
			<button type="button" data-testid="set-sepia" onClick={() => setTheme("sepia")}>
				set-sepia
			</button>
		</div>
	);
}

type ScriptElement = ReactElement<{
	dangerouslySetInnerHTML?: { __html?: string };
	nonce?: string;
	suppressHydrationWarning?: boolean;
}>;

beforeEach(() => {
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");
	document.documentElement.style.colorScheme = "";
	localStorage.clear();
	sessionStorage.clear();
	clearCookies();
	window.matchMedia = () =>
		({
			matches: false,
			addEventListener: () => {},
			removeEventListener: () => {},
		}) as unknown as MediaQueryList;
});

afterEach(() => {
	cleanup();
	insertedHtmlCallbacks.length = 0;
	localStorage.clear();
	sessionStorage.clear();
	clearCookies();
});

describe("createThemes Next pairing", () => {
	test("NextThemeProvider injects a bootstrap that includes the factory theme tuple", () => {
		render(
			<NextThemeProvider>
				<ThemeReader />
			</NextThemeProvider>,
		);

		const callback = insertedHtmlCallbacks[0];
		expect(callback).toBeDefined();
		const script = callback?.();
		expect(isValidElement(script)).toBe(true);
		expect((script as ScriptElement).type).toBe("script");
		expect((script as ScriptElement).props.dangerouslySetInnerHTML?.__html).toContain(
			'"sepia"',
		);
		expect((script as ScriptElement).props.dangerouslySetInnerHTML?.__html).toContain(
			'"light"',
		);
	});

	test("factory useTheme reads the NextThemeProvider context", () => {
		const view = render(
			<NextThemeProvider>
				<ThemeReader />
			</NextThemeProvider>,
		);

		expect(view.getByTestId("theme").textContent).toBe("light");

		act(() => {
			fireEvent.click(view.getByTestId("set-sepia"));
		});

		expect(view.getByTestId("theme").textContent).toBe("sepia");
	});

	test("client ThemeProvider from the same factory still works without the Next wrapper", () => {
		const view = render(
			<ThemeProvider>
				<ThemeReader />
			</ThemeProvider>,
		);

		expect(view.getByTestId("theme").textContent).toBe("light");
	});

	test("ThemeScript uses the factory theme tuple without a second themes array", () => {
		const view = render(<ThemeScript />);
		const script = view.container.querySelector("script");
		expect(script?.textContent).toContain('"sepia"');
		expect(script?.textContent).toContain('"light"');
		expect(script?.textContent).not.toContain("__name");
	});
});
