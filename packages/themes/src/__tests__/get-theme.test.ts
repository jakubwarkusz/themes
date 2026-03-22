import { describe, expect, test } from "bun:test";
import { getTheme } from "../get-theme.js";

function makeRequest(cookieHeader: string): Request {
	return new Request("https://example.com", {
		headers: { cookie: cookieHeader },
	});
}

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
	test("returns defaultTheme when next/headers is unavailable", async () => {
		expect(await getTheme({ defaultTheme: "dark" })).toBe("dark");
	});

	test("returns 'system' as default when no options provided", async () => {
		expect(await getTheme()).toBe("system");
	});
});
