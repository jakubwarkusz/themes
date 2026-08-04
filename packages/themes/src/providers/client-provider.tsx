"use client";

import { type ReactElement, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import {
	applyThemeToDom,
	getDomWindow,
	readStoredTheme,
	writeStoredTheme,
} from "../core/client-dom.js";
import { ThemeContext, type ThemeContextInstance } from "../core/context.js";
import { createThemeStore } from "../core/store.js";
import { isThemeSelection } from "../core/theme-validation.js";
import type {
	DefaultTheme,
	ResolvedTheme,
	ThemeContextValue,
	ThemeProviderProps,
} from "../core/types.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

export type ClientThemeProviderProps<Themes extends string = DefaultTheme> =
	ThemeProviderProps<Themes> & {
		themeContext?: ThemeContextInstance<Themes>;
	};

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
	onStorageError,
	themeContext = ThemeContext as ThemeContextInstance<Themes>,
}: ClientThemeProviderProps<Themes>): ReactElement {
	const requestedDefault = defaultTheme ?? (enableSystem ? "system" : themes[0]);
	const resolvedDefault = (
		themes.includes(requestedDefault as Themes) ||
		(enableSystem && requestedDefault === "system")
			? requestedDefault
			: themes[0]
	) as Themes | "system";

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

	const validForcedTheme = forcedTheme && themes.includes(forcedTheme) ? forcedTheme : undefined;
	const selectedTheme = validForcedTheme ?? theme;
	const resolvedTheme: ResolvedTheme<Themes> | undefined =
		selectedTheme === "system" || selectedTheme === undefined
			? (systemTheme as ResolvedTheme<Themes> | undefined)
			: (selectedTheme as ResolvedTheme<Themes>);

	const isValidTheme = useCallback(
		(candidate: string): candidate is Themes | "system" =>
			isThemeSelection(candidate, themes, enableSystem),
		[themes, enableSystem],
	);

	const onThemeChangeRef = useRef(onThemeChange);
	useEffect(() => {
		onThemeChangeRef.current = onThemeChange;
	});

	const applyToDom = useCallback(
		(resolved: string) => {
			applyThemeToDom({
				resolved,
				attribute,
				themes,
				valueMap,
				target,
				disableTransitionOnChange,
				enableColorScheme,
				themeColor,
			});
		},
		[
			attribute,
			disableTransitionOnChange,
			enableColorScheme,
			target,
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

		if (validForcedTheme) {
			setStoreTheme(validForcedTheme);
			applyToDom(validForcedTheme);
		} else if (initialTheme && isValidTheme(initialTheme)) {
			setStoreTheme(initialTheme);
			applyToDom(initialTheme === "system" ? (sys ?? "light") : initialTheme);
			writeStoredTheme(
				storage,
				storageKey,
				String(initialTheme),
				cookieOptions,
				onStorageError,
			);
		} else {
			const stored = readStoredTheme(storage, storageKey, onStorageError);

			const initial =
				!followSystem && stored && isValidTheme(stored)
					? (stored as Themes | "system")
					: resolvedDefault;

			setStoreState({ theme: initial, systemTheme: sys });
			applyToDom(initial === "system" ? (sys ?? "light") : initial);
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
		validForcedTheme,
		initialTheme,
		resolvedDefault,
		storage,
		storageKey,
		enableSystem,
		followSystem,
		isValidTheme,
		onStorageError,
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
				validForcedTheme ??
				(theme === "system" || theme === undefined ? systemTheme : theme);
			if (resolved) applyToDom(resolved);
		};
		domWindow.addEventListener("pageshow", handler);
		domWindow.addEventListener("popstate", handler);
		return () => {
			domWindow.removeEventListener("pageshow", handler);
			domWindow.removeEventListener("popstate", handler);
		};
	}, [applyToDom, validForcedTheme, getSnapshot]);

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		if (storage === "none" || storage === "sessionStorage" || storage === "cookie") return;

		const handler = (e: StorageEvent) => {
			if (e.storageArea !== localStorage || e.key !== storageKey) return;
			const newTheme = e.newValue ?? resolvedDefault;
			if (!isValidTheme(newTheme)) return;
			const resolved =
				newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;
			setStoreTheme(newTheme);
			if (!validForcedTheme) applyToDom(resolved);
		};
		domWindow.addEventListener("storage", handler);
		return () => domWindow.removeEventListener("storage", handler);
	}, [
		storage,
		storageKey,
		resolvedDefault,
		isValidTheme,
		validForcedTheme,
		applyToDom,
		getSnapshot,
		setStoreTheme,
	]);

	const setTheme = useCallback(
		(
			next:
				| Themes
				| "system"
				| ((current: Themes | "system" | undefined) => Themes | "system"),
		) => {
			if (validForcedTheme) return;

			const current = getSnapshot().theme as Themes | "system" | undefined;
			const newTheme = typeof next === "function" ? next(current) : next;
			if (!isValidTheme(newTheme)) return;
			const resolved =
				newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;

			setStoreTheme(newTheme);
			applyToDom(resolved);
			onThemeChangeRef.current?.(newTheme as Themes);

			writeStoredTheme(storage, storageKey, newTheme, cookieOptions, onStorageError);
		},
		[
			applyToDom,
			cookieOptions,
			validForcedTheme,
			storage,
			storageKey,
			onStorageError,
			isValidTheme,
			getSnapshot,
			setStoreTheme,
		],
	);

	const contextTheme = theme !== undefined && isValidTheme(theme) ? theme : undefined;
	const contextValue: ThemeContextValue<Themes> = {
		theme: validForcedTheme ?? contextTheme,
		resolvedTheme,
		systemTheme,
		forcedTheme: validForcedTheme,
		themes,
		setTheme,
	};
	const ContextProvider = themeContext.Provider;

	return <ContextProvider value={contextValue}>{children}</ContextProvider>;
}
