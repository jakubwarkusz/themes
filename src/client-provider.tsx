"use client";

import { type ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { ThemeContext } from "./context.js";
import type { DefaultTheme, ThemeContextValue, ThemeProviderProps } from "./types.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

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
	onThemeChange,
}: ThemeProviderProps<Themes>): ReactElement {
	const resolvedDefault = (defaultTheme ?? (enableSystem ? "system" : "light")) as
		| Themes
		| "system";

	const [theme, setThemeState] = useState<Themes | "system" | undefined>(undefined);
	const [systemTheme, setSystemTheme] = useState<"light" | "dark" | undefined>(undefined);

	const resolvedTheme: Themes | undefined =
		forcedTheme ??
		(theme === "system" || theme === undefined ? (systemTheme as Themes | undefined) : theme);

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
		},
		[attribute, disableTransitionOnChange, enableColorScheme, getTargetEl, themes, valueMap],
	);

	useEffect(() => {
		if (forcedTheme) {
			setThemeState(forcedTheme);
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

		setThemeState(initial);
	}, [forcedTheme, resolvedDefault, storage, storageKey, themes]);

	useEffect(() => {
		if (!enableSystem) return;

		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const sys = mq.matches ? "dark" : "light";
		setSystemTheme(sys);

		const handler = (e: MediaQueryListEvent) => {
			const next = e.matches ? "dark" : "light";
			setSystemTheme(next);
			if (theme === "system" || theme === undefined) {
				applyToDom(next);
				onThemeChangeRef.current?.(next as Themes);
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [enableSystem, theme, applyToDom]);

	useEffect(() => {
		if (storage === "none") return;

		const handler = (e: StorageEvent) => {
			if (e.key !== storageKey || !e.newValue) return;
			if ((themes as string[]).includes(e.newValue)) {
				const newTheme = e.newValue as Themes | "system";
				const resolved = newTheme === "system" ? (systemTheme ?? "light") : newTheme;
				setThemeState(newTheme);
				applyToDom(resolved);
			}
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, [storage, storageKey, themes, systemTheme, applyToDom]);

	const setTheme = useCallback(
		(
			next:
				| Themes
				| "system"
				| ((current: Themes | "system" | undefined) => Themes | "system"),
		) => {
			if (forcedTheme) return;

			const newTheme = typeof next === "function" ? next(theme) : next;
			const resolved = newTheme === "system" ? (systemTheme ?? "light") : newTheme;

			setThemeState(newTheme);
			applyToDom(resolved);
			onThemeChangeRef.current?.(resolved as Themes);

			try {
				if (storage !== "none") {
					const store = storage === "localStorage" ? localStorage : sessionStorage;
					store.setItem(storageKey, newTheme);
				}
			} catch {}
		},
		[applyToDom, forcedTheme, storage, storageKey, systemTheme, theme],
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
