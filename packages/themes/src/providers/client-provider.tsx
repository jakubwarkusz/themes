"use client";

import { type ReactElement, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { ThemeContext } from "../core/context.js";
import { writeCookie } from "../core/cookie.js";
import { createThemeStore } from "../core/store.js";
import type {
	DefaultTheme,
	ThemeColor,
	ThemeContextValue,
	ThemeProviderProps,
} from "../core/types.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

function resolveThemeColor(themeColor: ThemeColor, resolved: string): string | undefined {
	if (typeof themeColor === "string") return themeColor;
	return themeColor[resolved];
}

function updateMetaThemeColor(color: string | undefined): void {
	if (!color) return;
	let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
	if (!meta) {
		meta = document.createElement("meta");
		meta.name = "theme-color";
		document.head.appendChild(meta);
	}
	meta.content = color;
}

function classAttributeNeedsUpdate(
	el: Element,
	currentValues: string[],
	nextValues: string[],
): boolean {
	return (
		currentValues.some(
			(token) => !nextValues.includes(token) && el.classList.contains(token),
		) || nextValues.some((token) => !el.classList.contains(token))
	);
}

function getDomWindow(): (Window & typeof globalThis) | null {
	if (typeof document === "undefined") return null;
	return document.defaultView;
}

function readCookieValue(key: string): string | null {
	const parts = `; ${document.cookie}`.split(`; ${key}=`);
	const encoded = parts.length > 1 ? parts.pop()?.split(";")[0] : null;
	let decoded: string | null = null;
	try {
		decoded = encoded ? decodeURIComponent(encoded) : null;
	} catch {}
	return decoded ? decoded : null;
}

function readStoredTheme(
	storage: ThemeProviderProps["storage"],
	storageKey: string,
): string | null {
	if (storage === "none") return null;
	if (storage === "cookie") return readCookieValue(storageKey);
	if (storage === "hybrid")
		return readCookieValue(storageKey) ?? localStorage.getItem(storageKey);
	if (storage === "localStorage") return localStorage.getItem(storageKey);
	return sessionStorage.getItem(storageKey);
}

function writeStoredTheme(
	storage: ThemeProviderProps["storage"],
	storageKey: string,
	theme: string,
	cookieOptions: ThemeProviderProps["cookieOptions"],
): void {
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
}

export function ClientThemeProvider<Themes extends string = DefaultTheme>({
	children,
	themes = DEFAULT_THEMES as Themes[],
	forcedTheme,
	enableSystem = true,
	defaultTheme,
	attribute = "class",
	value: valueMap,
	target = "html",
	disableTransitionOnChange = false,
	storage = "localStorage",
	storageKey = "theme",
	enableColorScheme = true,
	themeColor,
	followSystem = false,
	onThemeChange,
	initialTheme,
	cookieOptions,
}: ThemeProviderProps<Themes>): ReactElement {
	const resolvedDefault = (defaultTheme ?? (enableSystem ? "system" : "light")) as
		| Themes
		| "system";

	const storeRef = useRef(createThemeStore());
	const store = storeRef.current;
	const {
		getSnapshot,
		setState: setStoreState,
		setTheme: setStoreTheme,
		setSystemTheme: setStoreSystemTheme,
	} = store;

	const { theme, systemTheme } = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getServerSnapshot,
	);

	const resolvedTheme: Themes | undefined =
		forcedTheme ??
		(theme === "system" || theme === undefined
			? (systemTheme as Themes | undefined)
			: (theme as Themes));

	const onThemeChangeRef = useRef(onThemeChange);
	useEffect(() => {
		onThemeChangeRef.current = onThemeChange;
	});

	const getTargetEl = useCallback((): Element | null => {
		if (target === "html") return document.documentElement;
		if (target === "body") return document.body;
		return document.querySelector(target);
	}, [target]);

	const applyToDom = useCallback(
		(resolved: string) => {
			const el = getTargetEl();
			if (!el) return;

			const values: Partial<Record<string, string>> | undefined = valueMap;
			const attrValue = values?.[resolved] ?? resolved;
			const attrs = Array.isArray(attribute) ? attribute : [attribute];
			const classValues = themes.flatMap((t) => (values?.[t] ?? t).split(" "));
			const nextClassValues = attrValue.split(" ");
			let needsUpdate = false;
			let classChanged = false;
			for (const attr of attrs) {
				if (attr === "class") {
					classChanged = classAttributeNeedsUpdate(el, classValues, nextClassValues);
					needsUpdate = needsUpdate || classChanged;
				} else {
					needsUpdate = needsUpdate || el.getAttribute(attr) !== attrValue;
				}
			}

			if (needsUpdate && disableTransitionOnChange) {
				const transitionValue =
					typeof disableTransitionOnChange === "string"
						? disableTransitionOnChange
						: "none";
				const style = document.createElement("style");
				style.textContent = `*,*::before,*::after{transition:${transitionValue}!important}`;
				document.head.appendChild(style);
				requestAnimationFrame(() =>
					requestAnimationFrame(() => document.head.removeChild(style)),
				);
			}

			for (const attr of attrs) {
				if (attr === "class") {
					if (classChanged) {
						el.classList.remove(...classValues);
						el.classList.add(...nextClassValues);
					}
				} else {
					if (el.getAttribute(attr) !== attrValue) {
						el.setAttribute(attr, attrValue);
					}
				}
			}

			if (enableColorScheme && (resolved === "light" || resolved === "dark")) {
				(el as HTMLElement).style.colorScheme = resolved;
			}

			if (themeColor) {
				updateMetaThemeColor(resolveThemeColor(themeColor, resolved));
			}
		},
		[
			attribute,
			disableTransitionOnChange,
			enableColorScheme,
			getTargetEl,
			themes,
			valueMap,
			themeColor,
		],
	);

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		const mq =
			enableSystem && typeof domWindow.matchMedia === "function"
				? domWindow.matchMedia("(prefers-color-scheme: dark)")
				: null;
		const sys: "light" | "dark" | undefined = mq ? (mq.matches ? "dark" : "light") : undefined;
		if (sys) {
			setStoreSystemTheme(sys);
		}

		if (forcedTheme) {
			setStoreTheme(forcedTheme);
			applyToDom(forcedTheme);
		} else if (initialTheme) {
			setStoreTheme(initialTheme);
			applyToDom(initialTheme === "system" ? (sys ?? "light") : (initialTheme as string));
			try {
				writeStoredTheme(storage, storageKey, String(initialTheme), cookieOptions);
			} catch {}
		} else {
			let stored: string | null = null;
			try {
				stored = readStoredTheme(storage, storageKey);
			} catch {}

			const initial =
				!followSystem &&
				stored &&
				(themes.includes(stored as Themes) || (enableSystem && stored === "system"))
					? (stored as Themes | "system")
					: resolvedDefault;

			setStoreState({ theme: initial, systemTheme: sys });
			applyToDom(initial === "system" ? (sys ?? "light") : (initial as string));
		}

		if (!mq) return;
		const handler = (e: MediaQueryListEvent) => {
			const next = e.matches ? "dark" : "light";
			setStoreSystemTheme(next);
			const current = getSnapshot().theme;
			if (current === "system" || current === undefined || followSystem) {
				if (followSystem) {
					setStoreTheme("system");
				}
				applyToDom(next);
				onThemeChangeRef.current?.(next as Themes);
			}
		};
		mq.addEventListener?.("change", handler);
		return () => mq.removeEventListener?.("change", handler);
	}, [
		cookieOptions,
		forcedTheme,
		initialTheme,
		resolvedDefault,
		storage,
		storageKey,
		themes,
		enableSystem,
		followSystem,
		applyToDom,
		getSnapshot,
		setStoreState,
		setStoreTheme,
		setStoreSystemTheme,
	]);

	// Re-apply theme on bfcache restore (pageshow) and history navigation (popstate)
	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		const handler = () => {
			const { theme, systemTheme } = getSnapshot();
			const resolved =
				forcedTheme ?? (theme === "system" || theme === undefined ? systemTheme : theme);
			if (resolved) applyToDom(resolved);
		};
		domWindow.addEventListener("pageshow", handler);
		domWindow.addEventListener("popstate", handler);
		return () => {
			domWindow.removeEventListener("pageshow", handler);
			domWindow.removeEventListener("popstate", handler);
		};
	}, [applyToDom, forcedTheme, getSnapshot]);

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		if (storage === "none" || storage === "sessionStorage" || storage === "cookie") return;

		const handler = (e: StorageEvent) => {
			if (e.storageArea !== localStorage || e.key !== storageKey || !e.newValue) return;
			if (
				themes.includes(e.newValue as Themes) ||
				(enableSystem && e.newValue === "system")
			) {
				const newTheme = e.newValue as Themes | "system";
				const resolved =
					newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;
				setStoreTheme(newTheme);
				applyToDom(resolved);
			}
		};
		domWindow.addEventListener("storage", handler);
		return () => domWindow.removeEventListener("storage", handler);
	}, [storage, storageKey, themes, enableSystem, applyToDom, getSnapshot, setStoreTheme]);

	const setTheme = useCallback(
		(
			next:
				| Themes
				| "system"
				| ((current: Themes | "system" | undefined) => Themes | "system"),
		) => {
			if (forcedTheme) return;

			const current = getSnapshot().theme as Themes | "system" | undefined;
			const newTheme = typeof next === "function" ? next(current) : next;
			const resolved =
				newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;

			setStoreTheme(newTheme);
			applyToDom(resolved);
			onThemeChangeRef.current?.(newTheme as Themes);

			try {
				writeStoredTheme(storage, storageKey, newTheme, cookieOptions);
			} catch {}
		},
		[applyToDom, cookieOptions, forcedTheme, storage, storageKey, getSnapshot, setStoreTheme],
	);

	const contextValue: ThemeContextValue<string> = {
		theme: forcedTheme ?? theme,
		resolvedTheme,
		systemTheme,
		forcedTheme,
		themes,
		setTheme: setTheme as ThemeContextValue<string>["setTheme"],
	};

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
