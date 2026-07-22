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
});
