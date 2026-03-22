import { type Context, createContext, useContext } from "react";
import type { DefaultTheme, ThemeContextValue } from "./types.js";

export const ThemeContext: Context<ThemeContextValue<string> | undefined> = createContext<
	ThemeContextValue<string> | undefined
>(undefined);

export function useTheme<Themes extends string = DefaultTheme>(): ThemeContextValue<Themes> {
	const ctx = useContext(ThemeContext);

	if (!ctx) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return ctx as unknown as ThemeContextValue<Themes>;
}
