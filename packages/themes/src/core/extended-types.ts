import type { DefaultTheme, ThemeProviderProps } from "./types.js";

export type SystemThemeMap<Themes extends string = string> =
	| {
			light: Themes;
			dark: Themes;
	  }
	| Partial<Record<Themes, { light: Themes; dark: Themes }>>;

export type ExtendedThemeProviderProps<Themes extends string = DefaultTheme> =
	ThemeProviderProps<Themes> & {
		/** Synchronize providers using the same storage key in this document. */
		enableSameDocumentSync?: boolean;
		/** Resolve system light/dark preferences to custom themes or variant families. */
		systemThemeMap?: SystemThemeMap<Themes>;
		/** Client-only theme target. A ShadowRoot applies the theme to its host. */
		themeRoot?: Element | ShadowRoot;
	};

export type ExtendedNextThemeProviderProps<Themes extends string = DefaultTheme> = Omit<
	ExtendedThemeProviderProps<Themes>,
	"themeRoot"
>;
