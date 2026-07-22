import { type Context, createContext, useContext } from "react";
import type { DefaultTheme, ThemeContextValue } from "./types.js";

export type ThemeContextInstance<Themes extends string = string> = Context<
	ThemeContextValue<Themes> | undefined
>;

export function createThemeContext<Themes extends string = string>(): ThemeContextInstance<Themes> {
	return createContext<ThemeContextValue<Themes> | undefined>(undefined);
}

export const ThemeContext: ThemeContextInstance = createThemeContext();

export function useThemeFromContext<Themes extends string>(
	context: ThemeContextInstance<Themes>,
): ThemeContextValue<Themes> {
	const value = useContext(context);
	if (!value) throw new Error("useTheme must be used within its ThemeProvider");
	return value;
}

export function useTheme<Themes extends string = DefaultTheme>(): ThemeContextValue<Themes> {
	// The global context is intentionally unbound; callers select its theme union.
	return useThemeFromContext(ThemeContext) as unknown as ThemeContextValue<Themes>;
}
