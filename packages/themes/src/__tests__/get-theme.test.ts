import { beforeEach, describe, expect, mock, test } from "bun:test";
import { getTheme } from "../get-theme.js";

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

function makeRequest(cookieHeader: string): Request {
	return new Request("https://example.com", {
		headers: { cookie: cookieHeader },
	});
}

beforeEach(() => {
	nextCookieValue = undefined;
	nextCookieReads = 0;
});

describe("getTheme - sync (Request)", () => {
	test("returns stored theme from cookie", () => {
		expect(getTheme(makeRequest("theme=dark"))).toBe("dark");
	});

	test("returns defaultTheme when cookie is absent", () => {
		expect(getTheme(makeRequest(""), { defaultTheme: "dark" })).toBe("dark");
	});

	test("returns 'system' as default when no defaultTheme provided", () => {
		expect(getTheme(makeRequest(""))).toBe("system");
	});

	test("uses custom storageKey", () => {
		expect(getTheme(makeRequest("app-theme=light"), { storageKey: "app-theme" })).toBe("light");
	});

	test("ignores stored value not in themes list", () => {
		expect(
			getTheme(makeRequest("theme=unknown"), {
				themes: ["light", "dark"],
				defaultTheme: "light",
			}),
		).toBe("light");
	});

	test("accepts stored value when in themes list", () => {
		expect(getTheme(makeRequest("theme=dark"), { themes: ["light", "dark"] })).toBe("dark");
	});

	test("decodes URL-encoded cookie value", () => {
		expect(getTheme(makeRequest("theme=high%2Dcontrast"))).toBe("high-contrast");
	});

	test("ignores malformed URL-encoded cookie values", () => {
		expect(getTheme(makeRequest("theme=%E0%A4%A"), { defaultTheme: "dark" })).toBe("dark");
	});

	test("handles multiple cookies", () => {
		expect(getTheme(makeRequest("other=value; theme=dark; another=foo"))).toBe("dark");
	});

	test("handles storageKey with special regex characters", () => {
		expect(getTheme(makeRequest("theme.v2=light"), { storageKey: "theme.v2" })).toBe("light");
	});

	test("does not match partial cookie name", () => {
		expect(getTheme(makeRequest("xtheme=dark"), { defaultTheme: "light" })).toBe("light");
	});

	test("empty cookie value returns defaultTheme", () => {
		expect(getTheme(makeRequest("theme="), { defaultTheme: "dark" })).toBe("dark");
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
