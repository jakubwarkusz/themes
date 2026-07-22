import type { ReactNode, ScriptHTMLAttributes } from "react";

export type DefaultTheme = "light" | "dark" | "system";

export type Attribute = "class" | `data-${string}`;

export type ValueObject = Record<string, string>;

export type ThemeName<Themes extends readonly string[] | string = DefaultTheme> =
	Themes extends readonly (infer Theme extends string)[] ? Theme : Themes;

export type ThemeSelection<Themes extends string = DefaultTheme> = Themes | "system";

export type ResolvedTheme<Themes extends string = DefaultTheme> = Exclude<Themes, "system">;

export type ThemeValueObject<Themes extends string = string> = Partial<
	Record<ResolvedTheme<Themes>, string>
>;

export type StorageType = "localStorage" | "sessionStorage" | "cookie" | "hybrid" | "none";

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
export type ThemeColor<Themes extends string = string> =
	| string
	| Partial<Record<ResolvedTheme<Themes>, string>>;

export type ThemeScriptAttributes = ScriptHTMLAttributes<HTMLScriptElement> & {
	[key: `data-${string}`]: string | undefined;
};

export type SystemThemeMap<Themes extends string = string> =
	| {
			light: Themes;
			dark: Themes;
	  }
	| Partial<Record<Themes, { light: Themes; dark: Themes }>>;

export type ThemeProviderProps<Themes extends string = DefaultTheme> = {
	children: ReactNode;
	/** All available themes */
	themes?: readonly Themes[];
	/** Forced theme, overrides everything */
	forcedTheme?: Themes;
	/** Enable system preference via prefers-color-scheme */
	enableSystem?: boolean;
	/** Default theme when no preference stored */
	defaultTheme?: Themes | "system";
	/** HTML attribute(s) to set on target element */
	attribute?: Attribute | readonly Attribute[];
	/** Map theme name to attribute value */
	value?: ThemeValueObject<Themes>;
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
	/** Additional attributes for the pre-hydration script */
	scriptProps?: ThemeScriptAttributes;
	/** Reports storage read/write failures without interrupting theme updates */
	onStorageError?: (error: unknown) => void;
	/** Called when theme changes. Receives the selected theme (may be "system"), not the resolved value. When the system preference changes while the theme is set to "system", fires with the resolved value ("light" | "dark"). */
	onThemeChange?: (theme: ThemeSelection<Themes>) => void;
	/** Colors for meta theme-color tag, per theme or a single value */
	themeColor?: ThemeColor<Themes>;
	/** Always follow system preference changes, even after setTheme was called */
	followSystem?: boolean;
	/** Server-provided theme that overrides storage on mount (e.g. from a database). User can still call setTheme to change it. */
	initialTheme?: ThemeSelection<Themes>;
	/** Cookie options, only used when storage="cookie" */
	cookieOptions?: CookieOptions;
	/** Serializable mapping used to resolve custom variants when the system theme changes */
	systemThemeMap?: SystemThemeMap<Themes>;
	/** Client-only Element or ShadowRoot target. Use `target` for pre-hydration SSR support. */
	themeRoot?: Element | ShadowRoot;
};

export type ThemeContextValue<Themes extends string = DefaultTheme> = {
	/** Current theme (may be "system") */
	theme: ThemeSelection<Themes> | undefined;
	/** Resolved theme - never "system" */
	resolvedTheme: ResolvedTheme<Themes> | undefined;
	/** System preference */
	systemTheme: "light" | "dark" | undefined;
	/** Forced theme if set */
	forcedTheme: Themes | undefined;
	/** All available themes */
	themes: readonly Themes[];
	/** Set theme */
	setTheme: (
		theme:
			| ThemeSelection<Themes>
			| ((current: ThemeSelection<Themes> | undefined) => ThemeSelection<Themes>),
	) => void;
};
