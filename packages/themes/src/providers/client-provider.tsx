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
	const { getSnapshot, setTheme: setStoreTheme, setSystemTheme: setStoreSystemTheme } = store;

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

			const attrValue = valueMap?.[resolved] ?? resolved;
			const attrs = Array.isArray(attribute) ? attribute : [attribute];

			if (disableTransitionOnChange) {
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
					const toRemove = (themes as string[]).flatMap((t) =>
						(valueMap?.[t] ?? t).split(" "),
					);
					el.classList.remove(...toRemove);
					el.classList.add(...attrValue.split(" "));
				} else {
					el.setAttribute(attr, attrValue);
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
		const mq = enableSystem ? window.matchMedia("(prefers-color-scheme: dark)") : null;
		const sys: "light" | "dark" | undefined = mq ? (mq.matches ? "dark" : "light") : undefined;
		if (sys) setStoreSystemTheme(sys);

		if (forcedTheme) {
			setStoreTheme(forcedTheme);
			applyToDom(forcedTheme);
		} else if (initialTheme) {
			setStoreTheme(initialTheme);
			applyToDom(initialTheme === "system" ? (sys ?? "light") : (initialTheme as string));
			try {
				if (storage === "cookie") {
					writeCookie(storageKey, String(initialTheme), cookieOptions);
				} else if (storage !== "none") {
					const s = storage === "localStorage" ? localStorage : sessionStorage;
					s.setItem(storageKey, String(initialTheme));
				}
			} catch {}
		} else {
			let stored: string | null = null;
			try {
				if (storage === "cookie") {
					const re = new RegExp(
						"(?:^|;\\s*)" +
							storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
							"=([^;]*)",
					);
					const match = document.cookie.match(re);
					stored = match?.[1] != null ? decodeURIComponent(match[1]) : null;
				} else if (storage !== "none") {
					const s = storage === "localStorage" ? localStorage : sessionStorage;
					stored = s.getItem(storageKey);
				}
			} catch {}

			const initial =
				!followSystem &&
				stored &&
				((themes as string[]).includes(stored) || (enableSystem && stored === "system"))
					? (stored as Themes | "system")
					: resolvedDefault;

			setStoreTheme(initial);
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
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
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
		setStoreTheme,
		setStoreSystemTheme,
	]);

	// Re-apply theme on bfcache restore (pageshow) and history navigation (popstate)
	useEffect(() => {
		const handler = () => {
			const { theme, systemTheme } = getSnapshot();
			const resolved =
				forcedTheme ?? (theme === "system" || theme === undefined ? systemTheme : theme);
			if (resolved) applyToDom(resolved);
		};
		window.addEventListener("pageshow", handler);
		window.addEventListener("popstate", handler);
		return () => {
			window.removeEventListener("pageshow", handler);
			window.removeEventListener("popstate", handler);
		};
	}, [applyToDom, forcedTheme, getSnapshot]);

	useEffect(() => {
		if (storage === "none" || storage === "sessionStorage" || storage === "cookie") return;

		const handler = (e: StorageEvent) => {
			if (e.storageArea !== localStorage || e.key !== storageKey || !e.newValue) return;
			if ((themes as string[]).includes(e.newValue)) {
				const newTheme = e.newValue as Themes | "system";
				const resolved =
					newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;
				setStoreTheme(newTheme);
				applyToDom(resolved);
			}
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, [storage, storageKey, themes, applyToDom, getSnapshot, setStoreTheme]);

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
				if (storage === "cookie") {
					writeCookie(storageKey, newTheme, cookieOptions);
				} else if (storage !== "none") {
					const store = storage === "localStorage" ? localStorage : sessionStorage;
					store.setItem(storageKey, newTheme);
				}
			} catch {}
		},
		[applyToDom, cookieOptions, forcedTheme, storage, storageKey, getSnapshot, setStoreTheme],
	);

	const contextValue: ThemeContextValue<string> = {
		theme: forcedTheme ?? theme,
		resolvedTheme,
		systemTheme,
		forcedTheme,
		themes: themes as string[],
		setTheme: setTheme as ThemeContextValue<string>["setTheme"],
	};

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
