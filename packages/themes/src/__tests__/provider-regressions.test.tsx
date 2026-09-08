import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { useTheme } from "../core/context.js";
import { getExtendedScript } from "../core/extended-script.js";
import { getScript, type ScriptConfig } from "../core/script.js";
import { ClientThemeProvider } from "../providers/client-provider.js";
import { ExtendedClientThemeProvider } from "../providers/extended-client-provider.js";

function ThemeReader() {
	const { theme, resolvedTheme, systemTheme } = useTheme();
	return (
		<output data-testid="state">{JSON.stringify({ theme, resolvedTheme, systemTheme })}</output>
	);
}

function mockMedia() {
	const listeners = new Set<(event: { matches: boolean }) => void>();
	const query = {
		matches: true,
		addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) =>
			listeners.add(listener),
		removeEventListener: (_type: string, listener: (event: { matches: boolean }) => void) =>
			listeners.delete(listener),
	};
	window.matchMedia = () => query as unknown as MediaQueryList;
	return (matches: boolean) => {
		query.matches = matches;
		act(() => {
			for (const listener of listeners) listener({ matches });
		});
	};
}

let target: HTMLDivElement;

beforeEach(() => {
	target = document.createElement("div");
	target.id = "theme-regression";
	target.className = "layout";
	document.body.appendChild(target);
	localStorage.clear();
});

afterEach(() => {
	cleanup();
	target.remove();
	localStorage.clear();
});

for (const { name, Provider, bootstrap } of [
	{ name: "default", Provider: ClientThemeProvider, bootstrap: getScript },
	{
		name: "extended",
		Provider: ExtendedClientThemeProvider,
		bootstrap: (config: ScriptConfig) =>
			getExtendedScript({ ...config, systemThemeMap: undefined }),
	},
]) {
	describe(`${name} provider regressions`, () => {
		test("keeps the bootstrap's forced theme while tracking system changes", () => {
			const changeSystem = mockMedia();
			const onThemeChange = vi.fn();
			localStorage.setItem("theme", "light");
			const script = bootstrap({
				storageKey: "theme",
				attribute: "class",
				defaultTheme: "system",
				enableSystem: true,
				enableColorScheme: true,
				forcedTheme: "dark",
				themes: ["light", "dark"],
				value: undefined,
				target: "#theme-regression",
				storage: "localStorage",
				themeColors: undefined,
				initialTheme: undefined,
				disableTransitionOnChange: false,
				followSystem: true,
			});
			// oxlint-disable-next-line no-eval -- executes the shipped bootstrap in the test DOM.
			eval(script);
			expect(target.classList.contains("dark")).toBe(true);
			const view = render(
				<Provider
					forcedTheme="dark"
					followSystem
					target="#theme-regression"
					onThemeChange={onThemeChange}
				>
					<ThemeReader />
				</Provider>,
			);
			changeSystem(false);
			expect(JSON.parse(screen.getByTestId("state").textContent ?? "{}")).toEqual({
				theme: "dark",
				resolvedTheme: "dark",
				systemTheme: "light",
			});
			expect(target.className).toBe("layout dark");
			expect(target.style.colorScheme).toBe("dark");
			expect(onThemeChange).not.toHaveBeenCalled();
			expect(localStorage.getItem("theme")).toBe("light");

			view.rerender(
				<Provider followSystem target="#theme-regression" onThemeChange={onThemeChange}>
					<ThemeReader />
				</Provider>,
			);
			changeSystem(true);
			changeSystem(false);
			expect(target.className).toBe("layout light");
			expect(onThemeChange).toHaveBeenLastCalledWith("light");
		});

		test("honors a forced overlay on an existing system selection", () => {
			const changeSystem = mockMedia();
			const onThemeChange = vi.fn();
			const view = render(
				<Provider target="#theme-regression" onThemeChange={onThemeChange}>
					<ThemeReader />
				</Provider>,
			);
			view.rerender(
				<Provider
					forcedTheme="dark"
					target="#theme-regression"
					onThemeChange={onThemeChange}
				>
					<ThemeReader />
				</Provider>,
			);
			changeSystem(false);
			expect(target.className).toBe("layout dark");
			expect(onThemeChange).not.toHaveBeenCalled();
		});

		test("removes mapped classes when switching to a data attribute", () => {
			mockMedia();
			const value = { light: "light", dark: "dark palette-dark" };
			const view = render(
				<Provider forcedTheme="dark" value={value} target="#theme-regression">
					<span />
				</Provider>,
			);
			expect(target.className).toBe("layout dark palette-dark");
			view.rerender(
				<Provider
					forcedTheme="light"
					value={value}
					attribute="data-theme"
					target="#theme-regression"
				>
					<span />
				</Provider>,
			);
			expect(target.className).toBe("layout");
			expect(target.getAttribute("data-theme")).toBe("light");
			// Once class management is disabled, classes added by the app remain its own.
			target.classList.add("dark", "palette-dark");
			view.rerender(
				<Provider
					forcedTheme="dark"
					value={value}
					attribute="data-theme"
					target="#theme-regression"
				>
					<span />
				</Provider>,
			);
			expect(target.className).toBe("layout dark palette-dark");
		});

		test("restores a second target after the first provider unmounts", async () => {
			mockMedia();
			const firstTarget = document.createElement("div");
			firstTarget.id = "first-theme";
			document.body.appendChild(firstTarget);
			const providers = (first: boolean) => (
				<>
					{first && (
						<Provider key="first" forcedTheme="light" target="#first-theme">
							<span />
						</Provider>
					)}
					<Provider key="second" forcedTheme="dark" target="#theme-regression">
						<span />
					</Provider>
				</>
			);
			try {
				const view = render(providers(true));
				target.classList.remove("dark");
				await waitFor(() => expect(target.classList.contains("dark")).toBe(true));
				view.rerender(providers(false));
				firstTarget.className = "";
				target.classList.remove("dark");
				await waitFor(() => expect(target.classList.contains("dark")).toBe(true));
				expect(firstTarget.className).toBe("");
			} finally {
				firstTarget.remove();
			}
		});
	});
}
