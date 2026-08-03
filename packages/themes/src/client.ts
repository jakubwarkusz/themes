"use client";

export type { ThemedImageProps } from "./components/themed-image.js";
export { ThemedImage } from "./components/themed-image.js";
export { ThemeContext, useTheme } from "./core/context.js";
export type {
	Attribute,
	DefaultTheme,
	ResolvedTheme,
	StorageType,
	ThemeColor,
	ThemeContextValue,
	ThemeName,
	ThemeProviderProps,
	ThemeScriptAttributes,
	ThemeSelection,
	ThemeValueObject,
	ValueObject,
} from "./core/types.js";
export type {
	CreateThemesConfig,
	CreateThemesResult,
	ThemeValueMap,
	TypedThemedImageProps,
} from "./factory/create-themes.js";
export { createThemes } from "./factory/create-themes.js";
export { useHydrated } from "./hooks/use-hydrated.js";
export { useThemeEffect } from "./hooks/use-theme-effect.js";
export { useThemeValue } from "./hooks/use-theme-value.js";
export { ClientThemeProvider } from "./providers/client-provider.js";
