import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Activity, type ReactNode } from "react";
import { useTheme } from "../core/context.js";
import { ExtendedClientThemeProvider } from "../providers/extended-client-provider.js";
import { clearCookies } from "./setup.js";

(globalThis as unknown as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function ThemeConsumer({ prefix = "" }: { prefix?: string }) {
	const { theme, resolvedTheme, setTheme } = useTheme();
	return (
		<>
			<span data-testid={`${prefix}theme`}>{theme ?? "-"}</span>
			<span data-testid={`${prefix}resolved`}>{resolvedTheme ?? "-"}</span>
			<button type="button" data-testid={`${prefix}dark`} onClick={() => setTheme("dark")}>
				dark
			</button>
		</>
	);
}

type MockMediaQuery = {
	matches: boolean;
	addEventListener: (type: string, listener: EventListener) => void;
	removeEventListener: (type: string, listener: EventListener) => void;
	dispatchChange: (matches: boolean) => void;
};

function mockMatchMedia(prefersDark: boolean): MockMediaQuery {
	const listeners = new Set<(event: Partial<MediaQueryListEvent>) => void>();
	const mediaQuery: MockMediaQuery = {
		matches: prefersDark,
		addEventListener: (_type, listener) =>
			listeners.add(listener as (event: Partial<MediaQueryListEvent>) => void),
		removeEventListener: (_type, listener) =>
			listeners.delete(listener as (event: Partial<MediaQueryListEvent>) => void),
		dispatchChange: (matches) => {
			mediaQuery.matches = matches;
			for (const listener of listeners) listener({ matches } as Partial<MediaQueryListEvent>);
		},
	};
	window.matchMedia = () => mediaQuery as unknown as MediaQueryList;
	return mediaQuery;
}

function wrap(
	children: ReactNode,
	props: Omit<Parameters<typeof ExtendedClientThemeProvider>[0], "children"> = {},
) {
	return render(<ExtendedClientThemeProvider {...props}>{children}</ExtendedClientThemeProvider>);
}

beforeEach(() => {
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");
	document.documentElement.style.colorScheme = "";
	document.querySelector('meta[name="theme-color"]')?.remove();
	localStorage.clear();
	sessionStorage.clear();
	clearCookies();
	mockMatchMedia(false);
});

afterEach(() => {
	cleanup();
	localStorage.clear();
	sessionStorage.clear();
	clearCookies();
});

describe("ExtendedClientThemeProvider", () => {
	test("resolves system to custom theme names", () => {
		mockMatchMedia(true);
		wrap(<ThemeConsumer />, {
			themes: ["paper", "midnight"],
			defaultTheme: "system",
			systemThemeMap: { light: "paper", dark: "midnight" },
		});

		expect(screen.getByTestId("resolved").textContent).toBe("midnight");
		expect(document.documentElement.classList.contains("midnight")).toBe(true);
	});

	test("preserves a custom variant family while following system", () => {
		const mediaQuery = mockMatchMedia(false);
		wrap(<ThemeConsumer />, {
			themes: ["light-red", "dark-red", "light-blue", "dark-blue"],
			defaultTheme: "light-red",
			followSystem: true,
			systemThemeMap: {
				"light-red": { light: "light-red", dark: "dark-red" },
				"dark-red": { light: "light-red", dark: "dark-red" },
				"light-blue": { light: "light-blue", dark: "dark-blue" },
				"dark-blue": { light: "light-blue", dark: "dark-blue" },
			},
		});

		act(() => mediaQuery.dispatchChange(true));

		expect(screen.getByTestId("theme").textContent).toBe("light-red");
		expect(screen.getByTestId("resolved").textContent).toBe("dark-red");
		expect(document.documentElement.classList.contains("dark-red")).toBe(true);
	});

	test("keeps same-document synchronization disabled by default", () => {
		render(
			<>
				<ExtendedClientThemeProvider
					storageKey="shared-disabled"
					enableSystem={false}
					defaultTheme="light"
				>
					<ThemeConsumer prefix="first-" />
				</ExtendedClientThemeProvider>
				<ExtendedClientThemeProvider
					storageKey="shared-disabled"
					enableSystem={false}
					defaultTheme="light"
				>
					<ThemeConsumer prefix="second-" />
				</ExtendedClientThemeProvider>
			</>,
		);

		act(() => fireEvent.click(screen.getByTestId("first-dark")));

		expect(screen.getByTestId("first-theme").textContent).toBe("dark");
		expect(screen.getByTestId("second-theme").textContent).toBe("light");
	});

	test("synchronizes providers when enabled", () => {
		render(
			<>
				<ExtendedClientThemeProvider storageKey="shared-enabled" enableSameDocumentSync>
					<ThemeConsumer prefix="first-" />
				</ExtendedClientThemeProvider>
				<ExtendedClientThemeProvider storageKey="shared-enabled" enableSameDocumentSync>
					<ThemeConsumer prefix="second-" />
				</ExtendedClientThemeProvider>
			</>,
		);

		act(() => fireEvent.click(screen.getByTestId("first-dark")));

		expect(screen.getByTestId("first-theme").textContent).toBe("dark");
		expect(screen.getByTestId("second-theme").textContent).toBe("dark");
	});

	test("refreshes an Activity-preserved provider when visible", () => {
		const providers = (mode: "hidden" | "visible") => (
			<>
				<Activity mode={mode}>
					<ExtendedClientThemeProvider storageKey="activity" enableSameDocumentSync>
						<ThemeConsumer prefix="preserved-" />
					</ExtendedClientThemeProvider>
				</Activity>
				<ExtendedClientThemeProvider storageKey="activity" enableSameDocumentSync>
					<ThemeConsumer prefix="active-" />
				</ExtendedClientThemeProvider>
			</>
		);
		const view = render(providers("hidden"));

		act(() => fireEvent.click(screen.getByTestId("active-dark")));
		view.rerender(providers("visible"));

		expect(screen.getByTestId("preserved-theme").textContent).toBe("dark");
	});

	test("removes stale mapped classes after value changes", () => {
		const view = render(
			<ExtendedClientThemeProvider value={{ dark: "old-dark" }} defaultTheme="dark">
				<ThemeConsumer />
			</ExtendedClientThemeProvider>,
		);
		expect(document.documentElement.classList.contains("old-dark")).toBe(true);

		view.rerender(
			<ExtendedClientThemeProvider value={{ dark: "new-dark" }} defaultTheme="dark">
				<ThemeConsumer />
			</ExtendedClientThemeProvider>,
		);

		expect(document.documentElement.classList.contains("old-dark")).toBe(false);
		expect(document.documentElement.classList.contains("new-dark")).toBe(true);
	});

	test("restores dynamic color scheme and theme-color state", () => {
		const view = render(
			<ExtendedClientThemeProvider defaultTheme="dark" enableColorScheme themeColor="#000">
				<ThemeConsumer />
			</ExtendedClientThemeProvider>,
		);
		expect(document.documentElement.style.colorScheme).toBe("dark");
		expect(document.querySelector('meta[name="theme-color"]')).not.toBeNull();

		view.rerender(
			<ExtendedClientThemeProvider defaultTheme="dark" enableColorScheme={false}>
				<ThemeConsumer />
			</ExtendedClientThemeProvider>,
		);

		expect(document.documentElement.style.colorScheme).toBe("");
		expect(document.querySelector('meta[name="theme-color"]')).toBeNull();
	});

	test("does not write storage when forcedTheme is set with initialTheme", () => {
		wrap(<ThemeConsumer />, { forcedTheme: "dark", initialTheme: "light" });

		expect(localStorage.getItem("theme")).toBeNull();
		expect(screen.getByTestId("theme").textContent).toBe("dark");
	});

	test("applies a client theme to a ShadowRoot host", () => {
		const host = document.createElement("div");
		document.body.appendChild(host);
		const shadowRoot = host.attachShadow({ mode: "open" });
		const appendedStyles: string[] = [];
		const origAppend = shadowRoot.appendChild.bind(shadowRoot);
		shadowRoot.appendChild = <T extends Node>(node: T): T => {
			if ((node as unknown as Element).tagName === "STYLE") {
				appendedStyles.push((node as unknown as Element).textContent ?? "");
			}
			return origAppend(node);
		};

		wrap(<ThemeConsumer />, {
			defaultTheme: "dark",
			themeRoot: shadowRoot,
			disableTransitionOnChange: true,
		});

		shadowRoot.appendChild = origAppend;
		expect(host.classList.contains("dark")).toBe(true);
		expect(appendedStyles.some((content) => content.includes("transition:none"))).toBe(true);
		host.remove();
	});
});
