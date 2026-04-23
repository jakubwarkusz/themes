export type GetThemeOptions = {
	/** Storage key used for the theme cookie. Defaults to `"theme"`. */
	storageKey?: string;
	/** Returned when no valid theme is found in the cookie. Defaults to `"system"`. */
	defaultTheme?: string;
	/** Valid theme names. When provided, stored values not in the list are ignored. */
	themes?: string[];
};

function readFromCookieString(
	cookieString: string,
	storageKey: string,
	defaultTheme: string,
	themes: string[] | undefined,
): string {
	const re = new RegExp(
		`(?:^|;\\s*)${storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
	);
	const match = cookieString.match(re);
	const stored = match?.[1] != null ? decodeURIComponent(match[1]) : null;
	if (!stored) return defaultTheme;
	if (themes && !themes.includes(stored)) return defaultTheme;
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
export function getTheme(request: Request, options?: GetThemeOptions): string;
export function getTheme(options?: GetThemeOptions): Promise<string>;
export function getTheme(
	requestOrOptions?: Request | GetThemeOptions,
	options?: GetThemeOptions,
): string | Promise<string> {
	const isRequest = requestOrOptions instanceof Request;
	const opts = (isRequest ? options : (requestOrOptions as GetThemeOptions | undefined)) ?? {};
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
			if (themes && !themes.includes(stored)) return defaultTheme;
			return stored;
		} catch {
			return defaultTheme;
		}
	})();
}
