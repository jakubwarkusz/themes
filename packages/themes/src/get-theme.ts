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

function readFromCookieString(
	cookieString: string,
	storageKey: string,
	defaultTheme: string,
	themes: readonly string[] | undefined,
): string {
	const re = new RegExp(
		`(?:^|;\\s*)${storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
	);
	const match = cookieString.match(re);
	const stored = match?.[1] != null ? safeDecodeURIComponent(match[1]) : null;
	if (!stored) return defaultTheme;
	if (!isThemeSelection(stored, themes)) return defaultTheme;
	return stored;
}

/**
 * Reads the current theme from a cookie.
 *
 * Pass a `Request` object for synchronous use in middleware or edge functions.
 * Call without arguments for async use in Server Components (reads via `cookies()` from `next/headers`).
 *
 * @example
 * // Proxy
 * export function proxy(request: Request) {
 *   const theme = getTheme(request, { defaultTheme: "dark" });
 *   // use theme to set a header, rewrite, etc.
 * }
 *
 * @example
 * // Server Component / layout.tsx
 * const theme = await getTheme({ defaultTheme: "dark" });
 * return <html className={theme}>...</html>;
 */
export function getTheme<
	const Themes extends readonly [string, ...string[]],
	const DefaultThemeValue extends ThemeSelection<ThemeName<Themes>> = "system",
>(
	request: Request,
	options: GetThemeOptions<Themes> & { themes: Themes; defaultTheme?: DefaultThemeValue },
): GetThemeResult<Themes, DefaultThemeValue>;
export function getTheme(request: Request, options?: UntypedGetThemeOptions): string;
export function getTheme<
	const Themes extends readonly [string, ...string[]],
	const DefaultThemeValue extends ThemeSelection<ThemeName<Themes>> = "system",
>(
	options: GetThemeOptions<Themes> & { themes: Themes; defaultTheme?: DefaultThemeValue },
): Promise<GetThemeResult<Themes, DefaultThemeValue>>;
export function getTheme(options?: UntypedGetThemeOptions): Promise<string>;
export function getTheme(
	requestOrOptions?: Request | RuntimeGetThemeOptions,
	options?: RuntimeGetThemeOptions,
): string | Promise<string> {
	const isRequest = requestOrOptions instanceof Request;
	const opts =
		(isRequest ? options : (requestOrOptions as RuntimeGetThemeOptions | undefined)) ?? {};
	const { storageKey = "theme", defaultTheme = "system", themes } = opts;

	if (isRequest) {
		const cookieHeader = requestOrOptions.headers.get("cookie") ?? "";
		return readFromCookieString(cookieHeader, storageKey, defaultTheme, themes);
	}

	return (async () => {
		try {
			const { cookies } = await import("next/headers");
			const cookieStore = await cookies();
			const stored = cookieStore.get(storageKey)?.value;
			if (!stored) return defaultTheme;
			if (!isThemeSelection(stored, themes)) return defaultTheme;
			return stored;
		} catch {
			return defaultTheme;
		}
	})();
}
