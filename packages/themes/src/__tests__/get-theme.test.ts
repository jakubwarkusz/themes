import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTheme, parseThemeCookie } from "../get-theme.js";

const srcDir = resolve(import.meta.dir, "..");

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

describe("parseThemeCookie", () => {
	test("returns stored theme from cookie header", () => {
		expect(parseThemeCookie("theme=dark")).toBe("dark");
	});

	test("returns defaultTheme when cookie is absent", () => {
		expect(parseThemeCookie("", { defaultTheme: "dark" })).toBe("dark");
	});

	test("returns 'system' as default when no defaultTheme provided", () => {
		expect(parseThemeCookie("")).toBe("system");
	});

	test("uses custom storageKey", () => {
		expect(parseThemeCookie("app-theme=light", { storageKey: "app-theme" })).toBe("light");
	});

	test("ignores stored value not in themes list", () => {
		expect(
			parseThemeCookie("theme=unknown", {
				themes: ["light", "dark"],
				defaultTheme: "light",
			}),
		).toBe("light");
	});

	test("accepts stored value when in themes list", () => {
		expect(parseThemeCookie("theme=dark", { themes: ["light", "dark"] })).toBe("dark");
	});

	test("decodes URL-encoded cookie value", () => {
		expect(parseThemeCookie("theme=high%2Dcontrast")).toBe("high-contrast");
	});

	test("ignores malformed URL-encoded cookie values", () => {
		expect(parseThemeCookie("theme=%E0%A4%A", { defaultTheme: "dark" })).toBe("dark");
	});

	test("handles multiple cookies", () => {
		expect(parseThemeCookie("other=value; theme=dark; another=foo")).toBe("dark");
	});

	test("handles storageKey with special regex characters", () => {
		expect(parseThemeCookie("theme.v2=light", { storageKey: "theme.v2" })).toBe("light");
	});

	test("does not match partial cookie name", () => {
		expect(parseThemeCookie("xtheme=dark", { defaultTheme: "light" })).toBe("light");
	});

	test("empty cookie value returns defaultTheme", () => {
		expect(parseThemeCookie("theme=", { defaultTheme: "dark" })).toBe("dark");
	});
});

describe("server helpers stay Next-free", () => {
	test("get-theme.ts and server.ts do not import next/headers", () => {
		expect(readFileSync(resolve(srcDir, "get-theme.ts"), "utf-8")).not.toContain(
			"next/headers",
		);
		expect(readFileSync(resolve(srcDir, "server.ts"), "utf-8")).not.toContain("next/headers");
	});
});
