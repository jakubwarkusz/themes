import { describe, expect, test } from "bun:test";
import {
	holdIfEqual,
	sameStringList,
	sameStringRecord,
	sameThemeColor,
} from "../core/config-equal.js";

describe("config-equal", () => {
	test("sameStringList compares by contents", () => {
		expect(sameStringList(["light", "dark"], ["light", "dark"])).toBe(true);
		expect(sameStringList(["light", "dark"], ["dark", "light"])).toBe(false);
	});

	test("sameStringRecord compares by contents", () => {
		expect(sameStringRecord({ dark: "night" }, { dark: "night" })).toBe(true);
		expect(sameStringRecord({ dark: "night" }, { dark: "day" })).toBe(false);
		expect(sameStringRecord(undefined, { dark: "night" })).toBe(false);
	});

	test("sameThemeColor compares strings and maps", () => {
		expect(sameThemeColor("#000", "#000")).toBe(true);
		expect(sameThemeColor({ dark: "#000" }, { dark: "#000" })).toBe(true);
		expect(sameThemeColor("#000", { dark: "#000" })).toBe(false);
	});

	test("holdIfEqual reuses the previous reference when equal", () => {
		const previous = ["light", "dark"];
		expect(holdIfEqual(previous, ["light", "dark"], sameStringList)).toBe(previous);
		expect(holdIfEqual(previous, ["light", "high-contrast"], sameStringList)).not.toBe(
			previous,
		);
	});
});
