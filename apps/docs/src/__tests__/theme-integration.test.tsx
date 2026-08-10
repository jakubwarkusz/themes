import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import "../../../../packages/themes/src/__tests__/setup.js";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/components/theme";

(globalThis as unknown as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function ThemeProbe() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	return (
		<>
			<span data-testid="theme">{theme}</span>
			<span data-testid="resolved-theme">{resolvedTheme}</span>
			<button type="button" onClick={() => setTheme("dark")}>
				Dark
			</button>
		</>
	);
}

beforeEach(() => {
	document.documentElement.className = "";
	localStorage.clear();
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
});

describe("docs theme integration", () => {
	test("applies the initial theme and switches through the typed docs module", () => {
		const view = render(
			<ThemeProvider>
				<ThemeProbe />
			</ThemeProvider>,
		);

		expect(view.getByTestId("theme").textContent).toBe("system");
		expect(view.getByTestId("resolved-theme").textContent).toBe("light");
		expect(document.documentElement.classList.contains("light")).toBe(true);

		act(() => fireEvent.click(view.getByRole("button", { name: "Dark" })));

		expect(view.getByTestId("theme").textContent).toBe("dark");
		expect(view.getByTestId("resolved-theme").textContent).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});
});
