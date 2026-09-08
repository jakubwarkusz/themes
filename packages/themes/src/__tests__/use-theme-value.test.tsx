import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import "./setup.js";
import { cleanup, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useThemeValue } from "../hooks/use-theme-value.js";
import { ClientThemeProvider } from "../providers/client-provider.js";

function ValueReader({
	values,
}: {
	values: Partial<Record<"light" | "dark" | "system" | "default", string>>;
}) {
	const value = useThemeValue(values);
	return <span data-testid="value">{value ?? "-"}</span>;
}

beforeEach(() => {
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

describe("useThemeValue", () => {
	test("prefers the resolved theme value", () => {
		const view = render(
			<ClientThemeProvider storage="none" defaultTheme="system">
				<ValueReader
					values={{ light: "Resolved", system: "Selected", default: "Fallback" }}
				/>
			</ClientThemeProvider>,
		);

		expect(view.getByTestId("value").textContent).toBe("Resolved");
	});

	test("falls back to the selected theme value", () => {
		const view = render(
			<ClientThemeProvider storage="none" defaultTheme="system">
				<ValueReader values={{ system: "Selected", default: "Fallback" }} />
			</ClientThemeProvider>,
		);

		expect(view.getByTestId("value").textContent).toBe("Selected");
	});

	test("falls back to default when neither theme has a value", () => {
		const view = render(
			<ClientThemeProvider storage="none" defaultTheme="dark">
				<ValueReader values={{ default: "Fallback" }} />
			</ClientThemeProvider>,
		);

		expect(view.getByTestId("value").textContent).toBe("Fallback");
	});

	test("returns the seeded resolved value during SSR", () => {
		const html = renderToStaticMarkup(
			<ClientThemeProvider storage="none" initialTheme="dark">
				<ValueReader values={{ light: "Light", dark: "Dark" }} />
			</ClientThemeProvider>,
		);
		expect(html).toContain('data-testid="value">Dark</span>');
	});
});
