"use client";

import { type ReactElement, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { ThemeContext } from "./context.js";
import { themeStore } from "./store.js";
import type { DefaultTheme, ThemeColor, ThemeContextValue, ThemeProviderProps } from "./types.js";

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
	onThemeChange,
}: ThemeProviderProps<Themes>): ReactElement {
	const resolvedDefault = (defaultTheme ?? (enableSystem ? "system" : "light")) as
		| Themes
		| "system";

	const { theme, systemTheme } = useSyncExternalStore(
		themeStore.subscribe,
		themeStore.getSnapshot,
		themeStore.getServerSnapshot,
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
				const style = document.createElement("style");
				style.textContent = "*,*::before,*::after{transition:none!important}";
				document.head.appendChild(style);
				requestAnimationFrame(() =>
					requestAnimationFrame(() => document.head.removeChild(style)),
				);
			}

			for (const attr of attrs) {
				if (attr === "class") {
					const toRemove = (themes as string[]).map((t) => valueMap?.[t] ?? t);
					el.classList.remove(...toRemove);
					el.classList.add(attrValue);
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
		if (forcedTheme) {
			themeStore.setTheme(forcedTheme);
			return;
		}

		let stored: string | null = null;
		try {
			if (storage !== "none") {
				const store = storage === "localStorage" ? localStorage : sessionStorage;
				stored = store.getItem(storageKey);
			}
		} catch {}

		const initial =
			stored && (themes as string[]).includes(stored)
				? (stored as Themes | "system")
				: resolvedDefault;

		themeStore.setTheme(initial);
	}, [forcedTheme, resolvedDefault, storage, storageKey, themes]);

	useEffect(() => {
		if (!enableSystem) return;

		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		themeStore.setSystemTheme(mq.matches ? "dark" : "light");

		const handler = (e: MediaQueryListEvent) => {
			const next = e.matches ? "dark" : "light";
			themeStore.setSystemTheme(next);
			const current = themeStore.getSnapshot().theme;
			if (current === "system" || current === undefined) {
				applyToDom(next);
				onThemeChangeRef.current?.(next as Themes);
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [enableSystem, applyToDom]);

	useEffect(() => {
		if (storage === "none") return;

		const handler = (e: StorageEvent) => {
			if (e.key !== storageKey || !e.newValue) return;
			if ((themes as string[]).includes(e.newValue)) {
				const newTheme = e.newValue as Themes | "system";
				const resolved =
					newTheme === "system"
						? (themeStore.getSnapshot().systemTheme ?? "light")
						: newTheme;
				themeStore.setTheme(newTheme);
				applyToDom(resolved);
			}
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, [storage, storageKey, themes, applyToDom]);

	const setTheme = useCallback(
		(
			next:
				| Themes
				| "system"
				| ((current: Themes | "system" | undefined) => Themes | "system"),
		) => {
			if (forcedTheme) return;

			const current = themeStore.getSnapshot().theme as Themes | "system" | undefined;
			const newTheme = typeof next === "function" ? next(current) : next;
			const resolved =
				newTheme === "system"
					? (themeStore.getSnapshot().systemTheme ?? "light")
					: newTheme;

			themeStore.setTheme(newTheme);
			applyToDom(resolved);
			onThemeChangeRef.current?.(resolved as Themes);

			try {
				if (storage !== "none") {
					const store = storage === "localStorage" ? localStorage : sessionStorage;
					store.setItem(storageKey, newTheme);
				}
			} catch {}
		},
		[applyToDom, forcedTheme, storage, storageKey],
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
