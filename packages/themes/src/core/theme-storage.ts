import { writeCookie } from "./cookie.js";
import type { CookieOptions, StorageType } from "./types.js";

function reportStorageError(
	onStorageError: ((error: unknown) => void) | undefined,
	error: unknown,
): void {
	try {
		onStorageError?.(error);
	} catch {}
}

function readCookieValue(key: string): string | null {
	const parts = `; ${document.cookie}`.split(`; ${key}=`);
	const encoded = parts.length > 1 ? parts.pop()?.split(";")[0] : null;
	try {
		return encoded ? decodeURIComponent(encoded) || null : null;
	} catch {
		return null;
	}
}

export function getDomWindow(): (Window & typeof globalThis) | null {
	if (typeof document === "undefined") return null;
	return document.defaultView;
}

export function readStoredTheme(
	storage: StorageType | undefined,
	storageKey: string,
	onStorageError?: (error: unknown) => void,
): string | null {
	try {
		if (storage === "none") return null;
		if (storage === "cookie") return readCookieValue(storageKey);
		if (storage === "hybrid")
			return readCookieValue(storageKey) ?? localStorage.getItem(storageKey);
		if (storage === "localStorage") return localStorage.getItem(storageKey);
		return sessionStorage.getItem(storageKey);
	} catch (error) {
		reportStorageError(onStorageError, error);
		return null;
	}
}

export function writeStoredTheme(
	storage: StorageType | undefined,
	storageKey: string,
	theme: string,
	cookieOptions: CookieOptions | undefined,
	onStorageError?: (error: unknown) => void,
): void {
	try {
		if (storage === "none") return;
		if (storage === "cookie") {
			writeCookie(storageKey, theme, cookieOptions);
			return;
		}
		if (storage === "hybrid") {
			writeCookie(storageKey, theme, cookieOptions);
			localStorage.setItem(storageKey, theme);
			return;
		}
		if (storage === "localStorage") {
			localStorage.setItem(storageKey, theme);
			return;
		}
		sessionStorage.setItem(storageKey, theme);
	} catch (error) {
		reportStorageError(onStorageError, error);
	}
}
