"use client";

import { createThemes as createThemesImplementation } from "./factory/create-themes.js";
import { ClientThemeProvider as ThemeProviderImplementation } from "./providers/client-provider.js";

export type {
	Attribute,
	DefaultTheme,
	ResolvedTheme,
	StorageType,
	SystemThemeMap,
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

export const ThemeProvider: typeof ThemeProviderImplementation = ThemeProviderImplementation;
export const createThemes: typeof createThemesImplementation = createThemesImplementation;
