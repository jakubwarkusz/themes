import type { CookieOptions } from "./types.js";

const COOKIE_NAME_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const SAME_SITE_VALUES = new Set(["Strict", "Lax", "None"]);

function assertCookieName(key: string): void {
	if (!COOKIE_NAME_RE.test(key)) {
		throw new TypeError("Invalid cookie name");
	}
}

function assertCookieAttributeValue(value: string, label: string): void {
	for (let index = 0; index < value.length; index += 1) {
		const charCode = value.charCodeAt(index);
		if (value[index] === ";" || charCode <= 0x1f || charCode === 0x7f) {
			throw new TypeError(`Invalid cookie ${label}`);
		}
	}
}

function assertCookieMaxAge(value: number): void {
	if (!Number.isFinite(value) || !Number.isInteger(value)) {
		throw new TypeError("Invalid cookie maxAge");
	}
}

function assertCookieSameSite(value: string): void {
	if (!SAME_SITE_VALUES.has(value)) {
		throw new TypeError("Invalid cookie sameSite");
	}
}

export function serializeCookie(key: string, value: string, options: CookieOptions = {}): string {
	const {
		domain,
		maxAge = 31536000,
		sameSite = "Lax",
		secure = location.protocol === "https:",
		path = "/",
	} = options;

	assertCookieName(key);
	assertCookieAttributeValue(path, "path");
	assertCookieMaxAge(maxAge);
	assertCookieSameSite(sameSite);
	if (domain) assertCookieAttributeValue(domain, "domain");

	let cookie = `${key}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`;
	if (secure) cookie += "; Secure";
	if (domain) cookie += `; domain=${domain}`;
	return cookie;
}

export function writeCookie(key: string, value: string, options: CookieOptions = {}): void {
	// biome-ignore lint/suspicious/noDocumentCookie: cookie storage requires direct document.cookie assignment
	document.cookie = serializeCookie(key, value, options);
}
