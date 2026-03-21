import { describe, expect, test } from "bun:test";
import { getScript } from "../script.js";

const base = {
	storageKey: "theme",
	attribute: "class" as const,
	defaultTheme: "system",
	enableSystem: true,
	enableColorScheme: true,
	forcedTheme: undefined,
	themes: ["light", "dark"],
	value: undefined,
	target: "html",
	storage: "localStorage" as const,
	themeColors: undefined,
};

describe("getScript", () => {
	test("returns a self-invoking function string", () => {
		const script = getScript(base);
		expect(script).toMatch(/^\(function/);
		expect(script).toMatch(/\)\(.*\)$/);
	});

	test("inlines all arguments", () => {
		const script = getScript(base);
		expect(script).toContain('"theme"');
		expect(script).toContain('"class"');
		expect(script).toContain('"system"');
		expect(script).toContain('["light","dark"]');
		expect(script).toContain('"html"');
		expect(script).toContain('"localStorage"');
	});

	test("strips __name artifacts", () => {
		const script = getScript(base);
		expect(script).not.toContain("__name");
	});

	test("inlines forcedTheme as JSON string", () => {
		const script = getScript({ ...base, forcedTheme: "dark" });
		expect(script).toContain('"dark"');
	});

	test("inlines null when forcedTheme is undefined", () => {
		const script = getScript({ ...base, forcedTheme: undefined });
		expect(script).toContain(",null,");
	});

	test("inlines value map", () => {
		const script = getScript({ ...base, value: { dark: "dark-mode", light: "light-mode" } });
		expect(script).toContain('"dark-mode"');
		expect(script).toContain('"light-mode"');
	});

	test("inlines null when value is undefined", () => {
		const script = getScript({ ...base, value: undefined });
		expect(script).toContain(",null,");
	});

	test("inlines attribute array", () => {
		const script = getScript({ ...base, attribute: ["class", "data-theme"] });
		expect(script).toContain('["class","data-theme"]');
	});

	test("inlines custom storageKey", () => {
		const script = getScript({ ...base, storageKey: "my-theme" });
		expect(script).toContain('"my-theme"');
	});

	test("inlines enableSystem as boolean literal", () => {
		const enabled = getScript({ ...base, enableSystem: true });
		const disabled = getScript({ ...base, enableSystem: false });
		expect(enabled).toContain(",true,");
		expect(disabled).toContain(",false,");
	});

	test("inlines enableColorScheme as boolean literal", () => {
		const enabled = getScript({ ...base, enableColorScheme: true });
		const disabled = getScript({ ...base, enableColorScheme: false });
		expect(enabled).toContain(",true,");
		expect(disabled).toContain(",false,");
	});

	test("inlines themeColors string", () => {
		const script = getScript({ ...base, themeColors: "var(--color-bg)" });
		expect(script).toContain('"var(--color-bg)"');
	});

	test("inlines themeColors map", () => {
		const script = getScript({ ...base, themeColors: { light: "#fff", dark: "#000" } });
		expect(script).toContain('"#fff"');
		expect(script).toContain('"#000"');
	});

	test("inlines sessionStorage", () => {
		const script = getScript({ ...base, storage: "sessionStorage" });
		expect(script).toContain('"sessionStorage"');
	});

	test("inlines storage none", () => {
		const script = getScript({ ...base, storage: "none" });
		expect(script).toContain('"none"');
	});

	test("inlines custom target selector", () => {
		const script = getScript({ ...base, target: "#app" });
		expect(script).toContain('"#app"');
	});

	test("output is syntactically a valid IIFE", () => {
		const script = getScript(base);
		expect(script.startsWith("(")).toBe(true);
		expect(script.endsWith(")")).toBe(true);
		expect(script).toContain("function");
	});
});
