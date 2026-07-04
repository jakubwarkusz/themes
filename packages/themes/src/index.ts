"use client";

export type {
	Attribute,
	DefaultTheme,
	ResolvedTheme,
	StorageType,
	ThemeColor,
	ThemeContextValue,
	ThemeName,
	ThemeProviderProps,
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
export { ClientThemeProvider as ThemeProvider } from "./providers/client-provider.js";
