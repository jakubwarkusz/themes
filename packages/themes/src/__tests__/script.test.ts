import { describe, expect, test } from "bun:test";
import { getScript } from "../core/script.js";

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
	initialTheme: undefined,
	disableTransitionOnChange: false,
	followSystem: false,
	systemThemeMap: undefined,
};

describe("getScript", () => {
	test("returns a self-invoking function string", () => {
		const script = getScript(base);
		expect(script).toMatch(/^\(\(/);
		expect(script).toMatch(/\)\(.*\)$/);
	});

	test("uses deterministic source instead of runtime function serialization", () => {
		const script = getScript(base);
		expect(script).not.toContain("__name");
		expect(script).toBe(getScript(base));
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

	test("escapes config values that could break out of the script tag", () => {
		const payload = "</script><script>globalThis.__themeXss = true</script>";
		const script = getScript({
			...base,
			forcedTheme: payload,
			themes: ["light", "dark", payload],
			value: { [payload]: payload },
			themeColors: { light: payload, dark: "line\u2028paragraph\u2029" },
			disableTransitionOnChange: "opacity 0s\u2028color 0s",
		});
		const wrapper = document.createElement("div");

		wrapper.innerHTML = `<script>${script}</script>`;

		expect(script).not.toContain("</script>");
		expect(script).toContain("\\u003c/script>");
		expect(script).toContain("\\u2028");
		expect(script).toContain("\\u2029");
		expect(wrapper.querySelectorAll("script")).toHaveLength(1);
		expect(wrapper.textContent).not.toContain("globalThis.__themeXss = true</script>");
	});

	test("inlines sessionStorage", () => {
		const script = getScript({ ...base, storage: "sessionStorage" });
		expect(script).toContain('"sessionStorage"');
	});

	test("inlines hybrid storage", () => {
		const script = getScript({ ...base, storage: "hybrid" });
		expect(script).toContain('"hybrid"');
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
		expect(script).toContain("=>");
	});
});
