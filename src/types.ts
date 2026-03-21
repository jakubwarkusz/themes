import type { ReactNode } from "react";

export type DefaultTheme = "light" | "dark" | "system";

export type Attribute = "class" | `data-${string}`;

export type ValueObject = Record<string, string>;

export type StorageType = "localStorage" | "sessionStorage" | "none";

/** Per-theme colors for meta theme-color, or a single string for all themes */
export type ThemeColor = string | Partial<Record<string, string>>;

export type ThemeProviderProps<Themes extends string = DefaultTheme> = {
	children: ReactNode;
	/** All available themes */
	themes?: Themes[];
	/** Forced theme, overrides everything */
	forcedTheme?: Themes;
	/** Enable system preference via prefers-color-scheme */
	enableSystem?: boolean;
	/** Default theme when no preference stored */
	defaultTheme?: Themes | "system";
	/** HTML attribute(s) to set on target element */
	attribute?: Attribute | Attribute[];
	/** Map theme name to attribute value */
	value?: ValueObject;
	/** Target element to apply theme to, defaults to <html> */
	target?: "html" | "body" | string;
	/** Disable CSS transitions on theme change */
	disableTransitionOnChange?: boolean;
	/** Where to persist theme */
	storage?: StorageType;
	/** Storage key */
	storageKey?: string;
	/** Set native color-scheme CSS property */
	enableColorScheme?: boolean;
	/** Nonce for CSP */
	nonce?: string;
	/** Called when theme changes */
	onThemeChange?: (theme: Themes) => void;
	/** Colors for meta theme-color tag, per theme or a single value */
	themeColor?: ThemeColor;
	/** Always follow system preference changes, even after setTheme was called */
	followSystem?: boolean;
};

export type ThemeContextValue<Themes extends string = DefaultTheme> = {
	/** Current theme (may be "system") */
	theme: Themes | "system" | undefined;
	/** Resolved theme - never "system" */
	resolvedTheme: Themes | undefined;
	/** System preference */
	systemTheme: "light" | "dark" | undefined;
	/** Forced theme if set */
	forcedTheme: Themes | undefined;
	/** All available themes */
	themes: Themes[];
	/** Set theme */
	setTheme: (
		theme: Themes | "system" | ((current: Themes | "system" | undefined) => Themes | "system"),
	) => void;
};
