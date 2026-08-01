"use client";

import { useTheme } from "../core/context.js";
import { resolveThemeValue, type ThemeValueMap } from "../core/theme-value.js";

/**
 * Returns the value from the map that corresponds to the current resolved theme.
 * Falls back to the selected theme and then `default` when no resolved-theme value exists.
 *
 * @example
 * const label = useThemeValue({ light: "Switch to dark", dark: "Switch to light" });
 * const color = useThemeValue({ light: "#fff", dark: "#000", purple: "#1a0a2e" });
 */
export function useThemeValue<Value>(map: ThemeValueMap<string, Value>): Value | undefined {
	const { theme, resolvedTheme } = useTheme<string>();
	return resolveThemeValue(map, theme, resolvedTheme);
}
