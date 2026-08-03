import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, renderHook } from "@testing-library/react";
import { Suspense } from "react";
import { renderToReadableStream } from "react-dom/server.browser";
import { ThemedImage } from "../components/themed-image.js";
import { ThemeContext } from "../core/context.js";
import type { ThemeContextValue } from "../core/types.js";
import { useHydrated } from "../hooks/use-hydrated.js";
import { ThemeScript } from "../theme-script.js";

afterEach(cleanup);

describe("public hydration and script APIs", () => {
	test("reports hydration without a mount effect", () => {
		const { result } = renderHook(() => useHydrated());
		expect(result.current).toBe(true);
	});

	test("renders a deterministic framework-neutral bootstrap", () => {
		const view = render(
			<ThemeScript defaultTheme="dark" scriptProps={{ "data-cfasync": "false" }} />,
		);
		const script = view.container.querySelector("script");
		expect(script?.getAttribute("data-cfasync")).toBe("false");
		expect(script?.textContent).toContain('"dark"');
		expect(script?.textContent).not.toContain("__name");
	});

	test("keeps the bootstrap in streamed Suspense HTML", async () => {
		const stream = await renderToReadableStream(
			<html lang="en">
				{/* biome-ignore lint/style/noHeadElement: this verifies a framework-neutral streamed HTML document */}
				<head>
					<Suspense fallback={null}>
						<ThemeScript defaultTheme="dark" />
					</Suspense>
				</head>
				<body>content</body>
			</html>,
		);
		const html = await new Response(stream).text();

		expect(html).toContain("<script");
		expect(html.indexOf("<script")).toBeLessThan(html.indexOf("<body"));
		expect(html).toContain('"dark"');
	});

	test("ThemedImage uses a placeholder until its context resolves", () => {
		const unresolved: ThemeContextValue<string> = {
			theme: undefined,
			resolvedTheme: undefined,
			systemTheme: undefined,
			forcedTheme: undefined,
			themes: ["light", "dark"],
			setTheme: () => {},
		};
		const view = render(
			<ThemeContext.Provider value={unresolved}>
				<ThemedImage
					src={{ light: "/light.png", dark: "/dark.png" }}
					alt="Theme preview"
					width={100}
					height={50}
				/>
			</ThemeContext.Provider>,
		);
		expect(view.getByAltText("Theme preview").getAttribute("src")).toContain("data:image/gif");
	});
});
