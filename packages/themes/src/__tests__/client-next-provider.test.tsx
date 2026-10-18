import { afterEach, describe, expect, vi, test } from "vitest";
import "./setup.js";
import { cleanup, render } from "@testing-library/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";

const insertedHtmlCallbacks: Array<() => ReactNode> = [];

vi.mock("next/navigation.js", () => ({
	useServerInsertedHTML: (callback: () => ReactNode) => {
		insertedHtmlCallbacks.push(callback);
	},
}));

const { ThemeProvider } = await import("../providers/next-provider.js");
const { ExtendedThemeProvider } = await import("../providers/extended-next-provider.js");

type ScriptElement = ReactElement<{
	dangerouslySetInnerHTML?: { __html?: string };
	nonce?: string;
	suppressHydrationWarning?: boolean;
}>;

afterEach(() => {
	cleanup();
	insertedHtmlCallbacks.length = 0;
});

for (const Provider of [ThemeProvider, ExtendedThemeProvider]) {
	test(`${Provider.name} forwards nonce and script attributes without changing the bootstrap`, () => {
		const props = {
			children: null,
			nonce: "explicit-nonce",
			scriptProps: { nonce: "fallback-nonce", "data-bootstrap-test": "forwarded" },
		};
		const client = Provider(props) as ReactElement<{ bootstrap: string }>;
		render(client);
		const script = insertedHtmlCallbacks[0]?.() as ReactElement<{
			nonce: string;
			"data-bootstrap-test": string;
			dangerouslySetInnerHTML: { __html: string };
		}>;
		expect(script.props.nonce).toBe("explicit-nonce");
		expect(script.props["data-bootstrap-test"]).toBe("forwarded");
		expect(script.props.dangerouslySetInnerHTML.__html).toBe(client.props.bootstrap);
	});
}

describe("ThemeProvider", () => {
	test("escapes server-generated configuration before passing it to the client", () => {
		const client = ThemeProvider({
			children: null,
			storageKey: "</script><script>alert(1)</script>\u2028\u2029",
		}) as ReactElement<{ bootstrap: string }>;
		expect(client.props.bootstrap).not.toContain("</script>");
		expect(client.props.bootstrap).toContain("\\u003c/script>");
		expect(client.props.bootstrap).not.toContain("\u2028");
		expect(client.props.bootstrap).not.toContain("\u2029");
	});

	test("injects a nonce-bearing theme script once", () => {
		render(
			<ThemeProvider storage="hybrid" initialTheme="dark" nonce="test-nonce">
				<span>content</span>
			</ThemeProvider>,
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

	test("preserves scriptProps.nonce when nonce prop is omitted", () => {
		render(
			<ThemeProvider scriptProps={{ nonce: "from-script-props" }}>
				<span>content</span>
			</ThemeProvider>,
		);

		const callback = insertedHtmlCallbacks[0];
		expect(callback).toBeDefined();
		const script = callback?.();
		expect(isValidElement(script)).toBe(true);
		expect((script as ScriptElement).props.nonce).toBe("from-script-props");
	});

	test("normalizes defaults against custom themes", () => {
		render(
			<ThemeProvider
				themes={["paper", "midnight"]}
				enableSystem={false}
				defaultTheme={"invalid" as "paper"}
			>
				<span>content</span>
			</ThemeProvider>,
		);

		const script = insertedHtmlCallbacks[0]?.() as ScriptElement;
		expect(script.props.dangerouslySetInnerHTML?.__html).toContain('"paper",false');
	});

	test("rejects system default when system mode is disabled", () => {
		render(
			<ThemeProvider
				themes={["paper", "midnight"]}
				enableSystem={false}
				defaultTheme="system"
			>
				<span>content</span>
			</ThemeProvider>,
		);

		const script = insertedHtmlCallbacks[0]?.() as ScriptElement;
		expect(script.props.dangerouslySetInnerHTML?.__html).toContain('"paper",false');
	});

	test("renders non-html target scripts after the provider subtree", () => {
		const view = render(
			<ThemeProvider
				target="body"
				nonce="body-nonce"
				scriptProps={{ "data-theme-bootstrap": "body" }}
			>
				<span data-testid="target-content">content</span>
			</ThemeProvider>,
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

describe("ExtendedThemeProvider", () => {
	test("injects mapped system themes before hydration", () => {
		render(
			<ExtendedThemeProvider
				themes={["paper", "midnight"]}
				systemThemeMap={{ light: "paper", dark: "midnight" }}
			>
				<span>content</span>
			</ExtendedThemeProvider>,
		);

		const script = insertedHtmlCallbacks[0]?.() as ScriptElement;
		expect(isValidElement(script)).toBe(true);
		expect(script.props.suppressHydrationWarning).toBe(true);
		expect(script.props.dangerouslySetInnerHTML?.__html).toContain('"midnight"');
	});

	test("preserves scriptProps.nonce when nonce prop is omitted", () => {
		render(
			<ExtendedThemeProvider scriptProps={{ nonce: "from-script-props" }}>
				<span>content</span>
			</ExtendedThemeProvider>,
		);

		const script = insertedHtmlCallbacks[0]?.() as ScriptElement;
		expect(isValidElement(script)).toBe(true);
		expect(script.props.nonce).toBe("from-script-props");
	});

	test("normalizes defaults against custom themes", () => {
		render(
			<ExtendedThemeProvider
				themes={["paper", "midnight"]}
				enableSystem={false}
				defaultTheme={"invalid" as "paper"}
			>
				<span>content</span>
			</ExtendedThemeProvider>,
		);

		const script = insertedHtmlCallbacks[0]?.() as ScriptElement;
		expect(script.props.dangerouslySetInnerHTML?.__html).toContain('"paper",false');
	});
});
