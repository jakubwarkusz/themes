"use client";

import { useTheme } from "../core/context.js";

/**
 * Returns the value from the map that corresponds to the current resolved theme.
 * Returns `undefined` if the theme hasn't resolved yet (e.g. during SSR).
 *
 * @example
 * const label = useThemeValue({ light: "Switch to dark", dark: "Switch to light" });
 * const color = useThemeValue({ light: "#fff", dark: "#000", purple: "#1a0a2e" });
 */
export function useThemeValue<T>(map: Record<string, T>): T | undefined {
	const { resolvedTheme } = useTheme();
	if (!resolvedTheme) return undefined;
	return map[resolvedTheme];
}
