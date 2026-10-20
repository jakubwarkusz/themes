import { afterEach, describe, expect, vi, test } from "vitest";
import "./setup.js";
import { cleanup, render } from "@testing-library/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemedImage } from "../components/themed-image.js";
import { useTheme } from "../core/context.js";
import { useThemeValue } from "../hooks/use-theme-value.js";

const insertedHtmlCallbacks: Array<() => ReactNode> = [];

vi.mock("next/navigation.js", () => ({
	useServerInsertedHTML: (callback: () => ReactNode) => {
		insertedHtmlCallbacks.push(callback);
	},
}));

const { ThemeProvider } = await import("../providers/next-provider.js");
const { ExtendedThemeProvider } = await import("../providers/extended-next-provider.js");
const { ClientNextThemeProvider } = await import("../providers/client-next-provider.js");
const { ExtendedClientNextThemeProvider } =
	await import("../providers/extended-client-next-provider.js");

type ScriptElement = ReactElement<{
	dangerouslySetInnerHTML?: { __html?: string };
	nonce?: string;
	suppressHydrationWarning?: boolean;
}>;

function ThemeConsumer() {
	const { theme, resolvedTheme } = useTheme();
	return (
		<div>
			<span data-testid="theme">{theme ?? "-"}</span>
			<span data-testid="resolved">{resolvedTheme ?? "-"}</span>
		</div>
	);
}

function ValueReader({
	values,
}: {
	values: Partial<Record<"light" | "dark" | "system" | "default", string>>;
}) {
	const value = useThemeValue(values);
	return <span data-testid="value">{value ?? "-"}</span>;
}

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

describe("ClientNextThemeProvider - SSR snapshots", () => {
	test("seeds theme and resolvedTheme from initialTheme", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider bootstrap="" storage="none" initialTheme="dark">
				<ThemeConsumer />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="theme">dark</span>');
		expect(html).toContain('data-testid="resolved">dark</span>');
	});

	test("leaves theme unknown when neither initialTheme nor forcedTheme is set", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider bootstrap="" storage="none">
				<ThemeConsumer />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="theme">-</span>');
		expect(html).toContain('data-testid="resolved">-</span>');
	});

	test("seeds theme and resolvedTheme from forcedTheme", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider bootstrap="" storage="none" forcedTheme="dark">
				<ThemeConsumer />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="theme">dark</span>');
		expect(html).toContain('data-testid="resolved">dark</span>');
	});

	test("forcedTheme wins over initialTheme", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider
				bootstrap=""
				storage="none"
				forcedTheme="dark"
				initialTheme="light"
			>
				<ThemeConsumer />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="theme">dark</span>');
		expect(html).toContain('data-testid="resolved">dark</span>');
	});

	test("initialTheme=system reports theme but not resolvedTheme", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider bootstrap="" storage="none" initialTheme="system">
				<ThemeConsumer />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="theme">system</span>');
		expect(html).toContain('data-testid="resolved">-</span>');
	});

	test("ignores initialTheme that is not in the themes list", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider
				bootstrap=""
				storage="none"
				initialTheme={"invalid" as "light"}
			>
				<ThemeConsumer />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="theme">-</span>');
		expect(html).toContain('data-testid="resolved">-</span>');
	});

	test("ThemedImage uses the seeded theme source", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider bootstrap="" storage="none" initialTheme="dark">
				<ThemedImage src={{ light: "/light.png", dark: "/dark.png" }} alt="Theme preview" />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain('src="/dark.png"');
		expect(html).not.toContain("data:image/gif");
	});

	test("ThemedImage keeps the placeholder when initialTheme is system", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider bootstrap="" storage="none" initialTheme="system">
				<ThemedImage src={{ light: "/light.png", dark: "/dark.png" }} alt="Theme preview" />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain("data:image/gif");
		expect(html).not.toContain("/dark.png");
		expect(html).not.toContain("/light.png");
	});

	test("useThemeValue returns the seeded resolved value", () => {
		const html = renderToStaticMarkup(
			<ClientNextThemeProvider bootstrap="" storage="none" initialTheme="dark">
				<ValueReader values={{ light: "Light", dark: "Dark" }} />
			</ClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="value">Dark</span>');
	});
});

describe("ExtendedClientNextThemeProvider - SSR snapshots", () => {
	test("seeds theme and resolvedTheme from initialTheme", () => {
		const html = renderToStaticMarkup(
			<ExtendedClientNextThemeProvider bootstrap="" storage="none" initialTheme="dark">
				<ThemeConsumer />
			</ExtendedClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="theme">dark</span>');
		expect(html).toContain('data-testid="resolved">dark</span>');
	});

	test("forcedTheme wins over initialTheme", () => {
		const html = renderToStaticMarkup(
			<ExtendedClientNextThemeProvider
				bootstrap=""
				storage="none"
				forcedTheme="dark"
				initialTheme="light"
			>
				<ThemeConsumer />
			</ExtendedClientNextThemeProvider>,
		);
		expect(html).toContain('data-testid="theme">dark</span>');
		expect(html).toContain('data-testid="resolved">dark</span>');
	});
});
