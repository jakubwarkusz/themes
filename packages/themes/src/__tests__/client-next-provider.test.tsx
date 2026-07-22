import { afterEach, describe, expect, mock, test } from "bun:test";
import "./setup.js";
import { cleanup, render } from "@testing-library/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";

const insertedHtmlCallbacks: Array<() => ReactNode> = [];

mock.module("next/navigation", () => ({
	useServerInsertedHTML: (callback: () => ReactNode) => {
		insertedHtmlCallbacks.push(callback);
	},
}));

const { ClientNextThemeProvider } = await import("../providers/client-next-provider.js");

type ScriptElement = ReactElement<{
	dangerouslySetInnerHTML?: { __html?: string };
	nonce?: string;
	suppressHydrationWarning?: boolean;
}>;

afterEach(() => {
	cleanup();
	insertedHtmlCallbacks.length = 0;
});

describe("ClientNextThemeProvider", () => {
	test("injects a nonce-bearing theme script once", () => {
		render(
			<ClientNextThemeProvider storage="hybrid" initialTheme="dark" nonce="test-nonce">
				<span>content</span>
			</ClientNextThemeProvider>,
		);

		const callback = insertedHtmlCallbacks[0];
		expect(callback).toBeDefined();
		const script = callback?.();
		expect(isValidElement(script)).toBe(true);
		expect((script as ScriptElement).type).toBe("script");
		expect((script as ScriptElement).props.suppressHydrationWarning).toBe(true);
		expect((script as ScriptElement).props.nonce).toBe("test-nonce");
		expect((script as ScriptElement).props.dangerouslySetInnerHTML?.__html).toContain('"dark"');
		expect(callback?.()).toBeNull();
	});

	test("normalizes defaults against custom themes", () => {
		render(
			<ClientNextThemeProvider
				themes={["paper", "midnight"]}
				enableSystem={false}
				defaultTheme={"invalid" as "paper"}
			>
				<span>content</span>
			</ClientNextThemeProvider>,
		);

		const script = insertedHtmlCallbacks[0]?.() as ScriptElement;
		expect(script.props.dangerouslySetInnerHTML?.__html).toContain('"paper",false');
	});

	test("rejects system default when system mode is disabled", () => {
		render(
			<ClientNextThemeProvider
				themes={["paper", "midnight"]}
				enableSystem={false}
				defaultTheme="system"
			>
				<span>content</span>
			</ClientNextThemeProvider>,
		);

		const script = insertedHtmlCallbacks[0]?.() as ScriptElement;
		expect(script.props.dangerouslySetInnerHTML?.__html).toContain('"paper",false');
	});

	test("renders non-html target scripts after the provider subtree", () => {
		const view = render(
			<ClientNextThemeProvider
				target="body"
				nonce="body-nonce"
				scriptProps={{ "data-theme-bootstrap": "body" }}
			>
				<span data-testid="target-content">content</span>
			</ClientNextThemeProvider>,
		);

		expect(insertedHtmlCallbacks[0]?.()).toBeNull();
		const content = view.getByTestId("target-content");
		const script = view.container.querySelector<HTMLScriptElement>(
			'script[data-theme-bootstrap="body"]',
		);
		expect(script).not.toBeNull();
		expect(script?.getAttribute("nonce")).toBe("body-nonce");
		expect(content.compareDocumentPosition(script as Node) & 4).toBe(4);
	});
});
