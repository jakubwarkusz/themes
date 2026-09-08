import { cookies } from "next/headers";
import type { ThemeName, ThemeSelection } from "./core/types.js";
import {
	getTheme as getThemeFromRequest,
	resolveStoredThemeValue,
	type GetThemeOptions,
	type GetThemeResult,
} from "./get-theme.js";

type UntypedGetThemeOptions = Omit<GetThemeOptions, "themes"> & {
	themes?: undefined;
};

type RuntimeGetThemeOptions = {
	storageKey?: string | undefined;
	defaultTheme?: string | undefined;
	themes?: readonly string[] | undefined;
};

const readThemeFromRequest = getThemeFromRequest as (
	request: Request,
	options?: RuntimeGetThemeOptions,
) => string;

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
	if (requestOrOptions instanceof Request) {
		return readThemeFromRequest(requestOrOptions, options);
	}

	const opts = requestOrOptions ?? {};
	const { storageKey = "theme", defaultTheme = "system" } = opts;

	return (async () => {
		try {
			const cookieStore = await cookies();
			const stored = cookieStore.get(storageKey)?.value;
			return resolveStoredThemeValue(stored, { ...opts, defaultTheme });
		} catch {
			return defaultTheme;
		}
	})();
}
