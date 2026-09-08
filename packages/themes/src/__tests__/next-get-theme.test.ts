import { beforeEach, describe, expect, mock, test } from "bun:test";

let nextCookieValue: string | undefined;
let nextCookieReads = 0;

mock.module("next/headers", () => ({
	cookies: async () => {
		nextCookieReads += 1;
		return {
			get: (_key: string) =>
				nextCookieValue === undefined
					? undefined
					: { name: "theme", value: nextCookieValue },
		};
	},
}));

const { getTheme } = await import("../next-get-theme.js");

function makeRequest(cookieHeader: string): Request {
	return new Request("https://example.com", {
		headers: { cookie: cookieHeader },
	});
}

beforeEach(() => {
	nextCookieValue = undefined;
	nextCookieReads = 0;
});

describe("getTheme - sync (Request) via /next wrapper", () => {
	test("delegates to the Request helper without reading next/headers", () => {
		expect(getTheme(makeRequest("theme=dark"))).toBe("dark");
		expect(nextCookieReads).toBe(0);
	});
});

describe("getTheme - async (no Request)", () => {
	test("returns defaultTheme when the cookie is absent", async () => {
		expect(await getTheme({ defaultTheme: "dark" })).toBe("dark");
	});

	test("returns 'system' as default when no options provided", async () => {
		expect(await getTheme()).toBe("system");
	});

	test("returns a valid stored theme", async () => {
		nextCookieValue = "dark";
		expect(await getTheme({ themes: ["light", "dark"] })).toBe("dark");
	});

	test("accepts system when a themes allowlist is provided", async () => {
		nextCookieValue = "system";
		expect(await getTheme({ themes: ["light", "dark"] })).toBe("system");
	});

	test("returns defaultTheme for unknown, encoded, or malformed values outside the allowlist", async () => {
		for (const stored of ["unknown", "high%2Dcontrast", "%E0%A4%A"]) {
			nextCookieValue = stored;
			expect(
				await getTheme({
					themes: ["light", "dark"],
					defaultTheme: "light",
				}),
			).toBe("light");
		}
	});
});

describe("Next ThemeProvider App Shell behavior", () => {
	test("leaves cookie reads to the pre-hydration script", async () => {
		nextCookieValue = "dark";
		const { ThemeProvider } = await import("../providers/next-provider.js");
		const element = ThemeProvider({
			children: null,
			storage: "cookie",
			themes: ["light", "dark"],
		});

		expect(nextCookieReads).toBe(0);
		expect((element.props as { storage?: string }).storage).toBe("cookie");
		expect((element.props as { initialTheme?: string }).initialTheme).toBeUndefined();
	});

	test("preserves an explicit initialTheme without reading request data", async () => {
		const { ThemeProvider } = await import("../providers/next-provider.js");
		const element = ThemeProvider({
			children: null,
			storage: "cookie",
			themes: ["light", "dark"],
			initialTheme: "dark",
		});

		expect(nextCookieReads).toBe(0);
		expect((element.props as { initialTheme?: string }).initialTheme).toBe("dark");
	});
});

describe("Extended Next ThemeProvider App Shell behavior", () => {
	test("leaves cookie reads to the pre-hydration script", async () => {
		nextCookieValue = "midnight";
		const { ExtendedThemeProvider } = await import("../providers/extended-next-provider.js");
		const element = ExtendedThemeProvider({
			children: null,
			storage: "cookie",
			themes: ["paper", "midnight"],
			systemThemeMap: { light: "paper", dark: "midnight" },
		});

		expect(nextCookieReads).toBe(0);
		expect((element.props as { initialTheme?: string }).initialTheme).toBeUndefined();
	});

	test("preserves an explicit initialTheme without reading request data", async () => {
		const { ExtendedThemeProvider } = await import("../providers/extended-next-provider.js");
		const element = ExtendedThemeProvider({
			children: null,
			storage: "cookie",
			themes: ["paper", "midnight"],
			initialTheme: "midnight",
			systemThemeMap: { light: "paper", dark: "midnight" },
		});

		expect(nextCookieReads).toBe(0);
		expect((element.props as { initialTheme?: string }).initialTheme).toBe("midnight");
	});
});
