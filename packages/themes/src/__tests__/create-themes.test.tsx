import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import "./setup.js";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { createThemes } from "../factory/create-themes.js";
import { clearCookies } from "./setup.js";

const { ThemeProvider, useTheme, useThemeValue, useThemeEffect } = createThemes({
	themes: ["light", "dark", "sepia"] as const,
	defaultTheme: "light",
	attribute: "class",
	storage: "none",
});

function ThemeReader({ children }: { children?: ReactNode }) {
	const { theme, setTheme } = useTheme();
	const label = useThemeValue({
		light: "Light",
		dark: "Dark",
		default: "Fallback",
	});

	return (
		<div>
			<span data-testid="theme">{theme ?? "-"}</span>
			<span data-testid="label">{label ?? "-"}</span>
			<button type="button" data-testid="set-dark" onClick={() => setTheme("dark")}>
				set-dark
			</button>
			<button type="button" data-testid="set-sepia" onClick={() => setTheme("sepia")}>
				set-sepia
			</button>
			{children}
		</div>
	);
}

function EffectProbe({ onChange }: { onChange: (value: string) => void }) {
	useThemeEffect((theme, resolvedTheme) => {
		onChange(`${theme ?? "none"}:${resolvedTheme ?? "none"}`);
	});
	return null;
}

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
	localStorage.clear();
	sessionStorage.clear();
	clearCookies();
});

describe("createThemes", () => {
	test("provides typed hooks bound to configured themes", () => {
		const view = render(
			<ThemeProvider>
				<ThemeReader />
			</ThemeProvider>,
		);

		expect(view.getByTestId("theme").textContent).toBe("light");
		expect(view.getByTestId("label").textContent).toBe("Light");

		act(() => {
			fireEvent.click(view.getByTestId("set-dark"));
		});

		expect(view.getByTestId("theme").textContent).toBe("dark");
		expect(view.getByTestId("label").textContent).toBe("Dark");
	});

	test("theme provider props override factory defaults per usage", () => {
		const view = render(
			<ThemeProvider defaultTheme="sepia">
				<ThemeReader />
			</ThemeProvider>,
		);

		expect(view.getByTestId("theme").textContent).toBe("sepia");
	});

	test("useThemeEffect skips first render and fires on theme change", () => {
		const calls: string[] = [];
		const view = render(
			<ThemeProvider>
				<ThemeReader>
					<EffectProbe onChange={(value) => calls.push(value)} />
				</ThemeReader>
			</ThemeProvider>,
		);

		expect(calls).toEqual(["light:light"]);

		act(() => {
			fireEvent.click(view.getByTestId("set-dark"));
		});

		expect(calls).toEqual(["light:light", "dark:dark"]);
	});
});
