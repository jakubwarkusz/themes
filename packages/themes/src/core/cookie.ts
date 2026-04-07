import type { CookieOptions } from "./types.js";

export function serializeCookie(key: string, value: string, options: CookieOptions = {}): string {
	const {
		domain,
		maxAge = 31536000,
		sameSite = "Lax",
		secure = location.protocol === "https:",
		path = "/",
	} = options;

	let cookie = `${key}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`;
	if (secure) cookie += "; Secure";
	if (domain) cookie += `; domain=${domain}`;
	return cookie;
}

export function writeCookie(key: string, value: string, options: CookieOptions = {}): void {
	// biome-ignore lint/suspicious/noDocumentCookie: cookie storage requires direct document.cookie assignment
	document.cookie = serializeCookie(key, value, options);
}
