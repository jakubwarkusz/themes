"use client";

import { ThemedImage as ThemedImageImplementation } from "./components/themed-image.js";
import {
	ThemeContext as themeContextImplementation,
	useTheme as useThemeImplementation,
} from "./core/context.js";
import { createThemes as createThemesImplementation } from "./factory/create-themes.js";
import { useHydrated as useHydratedImplementation } from "./hooks/use-hydrated.js";
import { useThemeEffect as useThemeEffectImplementation } from "./hooks/use-theme-effect.js";
import { useThemeValue as useThemeValueImplementation } from "./hooks/use-theme-value.js";
import { ClientThemeProvider as ClientThemeProviderImplementation } from "./providers/client-provider.js";

export type { ThemedImageProps } from "./components/themed-image.js";
export type {
	Attribute,
	CookieOptions,
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

export const ClientThemeProvider: typeof ClientThemeProviderImplementation =
	ClientThemeProviderImplementation;
export const ThemedImage: typeof ThemedImageImplementation = ThemedImageImplementation;
export const ThemeContext: typeof themeContextImplementation = themeContextImplementation;
export const createThemes: typeof createThemesImplementation = createThemesImplementation;
export const useHydrated: typeof useHydratedImplementation = useHydratedImplementation;
export const useTheme: typeof useThemeImplementation = useThemeImplementation;
export const useThemeEffect: typeof useThemeEffectImplementation = useThemeEffectImplementation;
export const useThemeValue: typeof useThemeValueImplementation = useThemeValueImplementation;
