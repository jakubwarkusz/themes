import { type Context, createContext, useContext } from "react";
import type { DefaultTheme, ThemeContextValue } from "./types.js";

export type ThemeContextInstance = Context<ThemeContextValue<string> | undefined>;

export function createThemeContext(): ThemeContextInstance {
	return createContext<ThemeContextValue<string> | undefined>(undefined);
}

export const ThemeContext: ThemeContextInstance = createThemeContext();

export function useThemeFromContext<Themes extends string = DefaultTheme>(
	context: ThemeContextInstance,
): ThemeContextValue<Themes> {
	const value = useContext(context);
	if (!value) throw new Error("useTheme must be used within its ThemeProvider");
	return value as unknown as ThemeContextValue<Themes>;
}

export function useTheme<Themes extends string = DefaultTheme>(): ThemeContextValue<Themes> {
	return useThemeFromContext<Themes>(ThemeContext);
}
