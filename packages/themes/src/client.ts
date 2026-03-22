"use client";

export type { ThemedImageProps } from "./components/themed-image.js";
export { ThemedImage } from "./components/themed-image.js";
export { useTheme } from "./core/context.js";
export type {
	Attribute,
	DefaultTheme,
	StorageType,
	ThemeColor,
	ThemeContextValue,
	ThemeProviderProps,
	ValueObject,
} from "./core/types.js";
export { useThemeValue } from "./hooks/use-theme-value.js";
export { ClientThemeProvider } from "./providers/client-provider.js";
