import type { ReactNode } from "react";

export type DefaultTheme = "light" | "dark" | "system";

export type Attribute = "class" | `data-${string}`;

export type ValueObject = Record<string, string>;

export type StorageType = "localStorage" | "sessionStorage" | "cookie" | "none";

export type CookieOptions = {
	/** Cookie domain, defaults to the current domain */
	domain?: string;
	/** Max age in seconds. Defaults to 31536000 (1 year) */
	maxAge?: number;
	/** SameSite attribute. Defaults to "Lax" */
	sameSite?: "Strict" | "Lax" | "None";
	/** Secure flag. Defaults to true on HTTPS */
	secure?: boolean;
	/** Cookie path. Defaults to "/" */
	path?: string;
};

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
	/** Disable CSS transitions on theme change. Pass `true` to disable all transitions, or a CSS `transition` value (e.g. `"background-color 0s, color 0s"`) to disable only specific properties while keeping others. */
	disableTransitionOnChange?: boolean | string;
	/** Where to persist theme */
	storage?: StorageType;
	/** Storage key */
	storageKey?: string;
	/** Set native color-scheme CSS property */
	enableColorScheme?: boolean;
	/** Nonce for CSP */
	nonce?: string;
	/** Called when theme changes. Receives the selected theme (may be "system"), not the resolved value. When the system preference changes while the theme is set to "system", fires with the resolved value ("light" | "dark"). */
	onThemeChange?: (theme: Themes | "system") => void;
	/** Colors for meta theme-color tag, per theme or a single value */
	themeColor?: ThemeColor;
	/** Always follow system preference changes, even after setTheme was called */
	followSystem?: boolean;
	/** Server-provided theme that overrides storage on mount (e.g. from a database). User can still call setTheme to change it. */
	initialTheme?: Themes | "system";
	/** Cookie options, only used when storage="cookie" */
	cookieOptions?: CookieOptions;
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
