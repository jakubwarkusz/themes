import { getTheme as getThemeImplementation } from "./get-theme.js";
import { ThemeProvider as ThemeProviderImplementation } from "./providers/next-provider.js";

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
export type { GetThemeOptions, GetThemeResult } from "./get-theme.js";

export const ThemeProvider: typeof ThemeProviderImplementation = ThemeProviderImplementation;
export const getTheme: typeof getThemeImplementation = getThemeImplementation;
