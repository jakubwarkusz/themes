import { isThemeSelection } from "./core/theme-validation.js";
import type { ThemeName, ThemeSelection } from "./core/types.js";

export type GetThemeOptions<Themes extends readonly string[] = readonly string[]> = {
	/** Storage key used for the theme cookie. Defaults to `"theme"`. */
	storageKey?: string;
	/** Returned when no valid theme is found in the cookie. Defaults to `"system"`. */
	defaultTheme?: ThemeSelection<ThemeName<Themes>>;
	/** Valid theme names. When provided, stored values not in the list are ignored. */
	themes?: Themes;
};

export type GetThemeResult<
	Themes extends readonly string[],
	DefaultThemeValue extends string = "system",
> = ThemeName<Themes> | DefaultThemeValue;

type UntypedGetThemeOptions = Omit<GetThemeOptions, "themes"> & {
	themes?: undefined;
};

type RuntimeGetThemeOptions = {
	storageKey?: string | undefined;
	defaultTheme?: string | undefined;
	themes?: readonly string[] | undefined;
};

function safeDecodeURIComponent(value: string): string | null {
	try {
		return decodeURIComponent(value);
	} catch {
		return null;
	}
}

/** Shared by cookie-header parsing and Next `cookies()`. Not part of the public `/server` API. */
export function resolveStoredThemeValue(
	stored: string | null | undefined,
	options?: {
		storageKey?: string | undefined;
		defaultTheme?: string | undefined;
		themes?: readonly string[] | undefined;
	},
): string {
	const defaultTheme = options?.defaultTheme ?? "system";
	const themes = options?.themes;
	if (!stored) return defaultTheme;
	if (!isThemeSelection(stored, themes)) return defaultTheme;
	return stored;
}

function parseThemeCookieRuntime(cookieHeader: string, options?: RuntimeGetThemeOptions): string {
	const storageKey = options?.storageKey ?? "theme";
	const re = new RegExp(
		`(?:^|;\\s*)${storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
	);
	const match = cookieHeader.match(re);
	const stored = match?.[1] != null ? safeDecodeURIComponent(match[1]) : null;
	return resolveStoredThemeValue(stored, options);
}

/**
 * Reads the current theme from a `Cookie` header string.
 *
 * @example
 * const theme = parseThemeCookie(request.headers.get("cookie") ?? "", { defaultTheme: "dark" });
 */
export function parseThemeCookie<
	const Themes extends readonly [string, ...string[]],
	const DefaultThemeValue extends ThemeSelection<ThemeName<Themes>> = "system",
>(
	cookieHeader: string,
	options: GetThemeOptions<Themes> & { themes: Themes; defaultTheme?: DefaultThemeValue },
): GetThemeResult<Themes, DefaultThemeValue>;
export function parseThemeCookie(cookieHeader: string, options?: UntypedGetThemeOptions): string;
export function parseThemeCookie(cookieHeader: string, options?: RuntimeGetThemeOptions): string {
	return parseThemeCookieRuntime(cookieHeader, options);
}

/**
 * Reads the current theme from a `Request` cookie header.
 *
 * @example
 * export function loader({ request }: { request: Request }) {
 *   const theme = getTheme(request, { defaultTheme: "dark" });
 *   return { theme };
 * }
 */
export function getTheme<
	const Themes extends readonly [string, ...string[]],
	const DefaultThemeValue extends ThemeSelection<ThemeName<Themes>> = "system",
>(
	request: Request,
	options: GetThemeOptions<Themes> & { themes: Themes; defaultTheme?: DefaultThemeValue },
): GetThemeResult<Themes, DefaultThemeValue>;
export function getTheme(request: Request, options?: UntypedGetThemeOptions): string;
export function getTheme(request: Request, options?: RuntimeGetThemeOptions): string {
	return parseThemeCookieRuntime(request.headers.get("cookie") ?? "", options);
}
