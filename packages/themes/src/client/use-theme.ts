"use client";

import {
    ThemeContext as themeContextImplementation,
    useTheme as useThemeImplementation,
} from "../core/context.js";

export type { DefaultTheme, ThemeContextValue } from "../core/types.js";

export const ThemeContext: typeof themeContextImplementation = themeContextImplementation;
export const useTheme: typeof useThemeImplementation = useThemeImplementation;
