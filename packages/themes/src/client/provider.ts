"use client";

import { ClientThemeProvider as ClientThemeProviderImplementation } from "../providers/client-provider.js";

export type {
	Attribute,
	CookieOptions,
	DefaultTheme,
	StorageType,
	SystemThemeMap,
	ThemeColor,
	ThemeProviderProps,
	ThemeScriptAttributes,
	ValueObject,
} from "../core/types.js";

export const ClientThemeProvider: typeof ClientThemeProviderImplementation =
	ClientThemeProviderImplementation;
