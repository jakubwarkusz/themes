import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";

const insertedHtml: ReactNode[] = [];

mock.module("next/navigation", () => ({
	useServerInsertedHTML: (callback: () => ReactNode) => {
		insertedHtml.push(callback());
	},
}));

const { ClientNextThemeProvider } = await import("../providers/client-next-provider.js");

type ScriptElement = ReactElement<{
	dangerouslySetInnerHTML?: { __html?: string };
	suppressHydrationWarning?: boolean;
	nonce?: string;
}>;

afterEach(() => {
	cleanup();
	insertedHtml.length = 0;
});

describe("ClientNextThemeProvider", () => {
	test("suppresses hydration warnings on the injected theme script", () => {
		render(
			<ClientNextThemeProvider storage="hybrid" initialTheme="dark">
				<span>content</span>
			</ClientNextThemeProvider>,
		);

		const script = insertedHtml[0];
		expect(isValidElement(script)).toBe(true);
		expect((script as ScriptElement).type).toBe("script");
		expect((script as ScriptElement).props.suppressHydrationWarning).toBe(true);
		expect((script as ScriptElement).props.dangerouslySetInnerHTML?.__html).toContain('"dark"');
	});

	test("preserves scriptProps.nonce when nonce prop is omitted", () => {
		render(
			<ClientNextThemeProvider scriptProps={{ nonce: "from-script-props" }}>
				<span>content</span>
			</ClientNextThemeProvider>,
		);

		const script = insertedHtml[0] as ScriptElement;
		expect(script.props.nonce).toBe("from-script-props");
	});
});
