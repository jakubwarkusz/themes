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
import { isThemeSelection, resolveDefaultTheme } from "../core/theme-validation.js";
import type {
	DefaultTheme,
	ResolvedTheme,
	ThemeContextValue,
	ThemeProviderProps,
} from "../core/types.js";
import { useEffectEvent } from "../core/use-effect-event.js";

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
	const resolvedDefault = resolveDefaultTheme(themes, enableSystem, defaultTheme);

	const storeRef = useRef<ReturnType<typeof createThemeStore> | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createThemeStore();
	}
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

	const onThemeChangeEvent = useEffectEvent((next: Themes) => {
		onThemeChange?.(next);
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
	const applyToDomEvent = useEffectEvent(applyToDom);
	const initializeEvent = useEffectEvent(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		const mq =
			enableSystem && typeof domWindow.matchMedia === "function"
				? domWindow.matchMedia("(prefers-color-scheme: dark)")
				: null;
		const system = mq ? (mq.matches ? "dark" : "light") : undefined;
		let initial: Themes | "system";

		if (initialTheme && isValidTheme(initialTheme)) {
			initial = initialTheme;
			writeStoredTheme(
				storage,
				storageKey,
				String(initialTheme),
				cookieOptions,
				onStorageError,
			);
		} else {
			const stored = readStoredTheme(storage, storageKey, onStorageError);
			initial =
				!followSystem && stored && isValidTheme(stored)
					? (stored as Themes | "system")
					: resolvedDefault;
		}

		setStoreState({ theme: initial, systemTheme: system });
	});
	const handleSystemChangeEvent = useEffectEvent((next: "light" | "dark") => {
		setStoreSystemTheme(next);
		const current = getSnapshot().theme;
		if (current === "system" || current === undefined || followSystem) {
			if (followSystem) {
				setStoreTheme("system");
			}
			applyToDomEvent(next);
			onThemeChangeEvent(next as Themes);
		}
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect events are intentionally non-reactive.
	useEffect(() => {
		initializeEvent();
	}, []);

	useEffect(() => {
		if (resolvedTheme) applyToDom(resolvedTheme);
	}, [resolvedTheme, applyToDom]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect events are intentionally non-reactive.
	useEffect(() => {
		const domWindow = getDomWindow();
		if (!enableSystem || !domWindow || typeof domWindow.matchMedia !== "function") return;
		const mq = domWindow.matchMedia("(prefers-color-scheme: dark)");
		setStoreSystemTheme(mq.matches ? "dark" : "light");
		const handler = (event: MediaQueryListEvent) => {
			handleSystemChangeEvent(event.matches ? "dark" : "light");
		};
		mq.addEventListener?.("change", handler);
		return () => mq.removeEventListener?.("change", handler);
	}, [enableSystem, setStoreSystemTheme]);

	// Re-apply theme on bfcache restore (pageshow) and history navigation (popstate)
	// biome-ignore lint/correctness/useExhaustiveDependencies: effect events are intentionally non-reactive.
	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		const handler = () => {
			const { theme, systemTheme } = getSnapshot();
			const resolved =
				validForcedTheme ??
				(theme === "system" || theme === undefined ? systemTheme : theme);
			if (resolved) applyToDomEvent(resolved);
		};
		domWindow.addEventListener("pageshow", handler);
		domWindow.addEventListener("popstate", handler);
		return () => {
			domWindow.removeEventListener("pageshow", handler);
			domWindow.removeEventListener("popstate", handler);
		};
	}, [validForcedTheme, getSnapshot]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect events are intentionally non-reactive.
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
			if (!validForcedTheme) applyToDomEvent(resolved);
		};
		domWindow.addEventListener("storage", handler);
		return () => domWindow.removeEventListener("storage", handler);
	}, [
		storage,
		storageKey,
		resolvedDefault,
		isValidTheme,
		validForcedTheme,
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
			onThemeChangeEvent(newTheme as Themes);

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
			onThemeChangeEvent,
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
