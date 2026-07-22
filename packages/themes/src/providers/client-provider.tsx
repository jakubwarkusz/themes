"use client";

import { type ReactElement, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import {
	type AppliedThemeState,
	applyThemeToDom,
	getDomWindow,
	readStoredTheme,
	writeStoredTheme,
} from "../core/client-dom.js";
import { ThemeContext, type ThemeContextInstance } from "../core/context.js";
import { createThemeStore } from "../core/store.js";
import { publishThemeChannel, subscribeThemeChannel } from "../core/sync.js";
import type {
	DefaultTheme,
	SystemThemeMap,
	ThemeContextValue,
	ThemeProviderProps,
} from "../core/types.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

function isDirectSystemMap(
	systemThemeMap: SystemThemeMap<string> | undefined,
): systemThemeMap is { light: string; dark: string } {
	if (!systemThemeMap) return false;
	const directMap = systemThemeMap as { light?: unknown; dark?: unknown };
	return typeof directMap.light === "string" && typeof directMap.dark === "string";
}

function resolveSelection(
	selection: string,
	systemTheme: "light" | "dark" | undefined,
	systemThemeMap: SystemThemeMap<string> | undefined,
): string | undefined {
	if (!systemTheme) return selection === "system" ? undefined : selection;
	if (!systemThemeMap) return selection === "system" ? systemTheme : selection;

	if (isDirectSystemMap(systemThemeMap)) {
		return selection === "system" ? systemThemeMap[systemTheme] : selection;
	}

	const variantMap = systemThemeMap as Partial<Record<string, { light: string; dark: string }>>;
	const variants = selection === "system" ? undefined : variantMap[selection];
	return variants?.[systemTheme] ?? (selection === "system" ? systemTheme : selection);
}

export type ClientThemeProviderProps<Themes extends string = DefaultTheme> =
	ThemeProviderProps<Themes> & {
		themeContext?: ThemeContextInstance;
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
	systemThemeMap,
	themeRoot,
	themeContext = ThemeContext,
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
	const appliedThemeRef = useRef<AppliedThemeState | undefined>(undefined);
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
	const resolvedTheme = selectedTheme
		? (resolveSelection(
			selectedTheme,
			systemTheme,
			systemThemeMap as SystemThemeMap<string> | undefined,
		) as Themes | undefined)
		: undefined;
	const channel = `${storage ?? "localStorage"}:${storageKey}:${target}`;

	const isValidTheme = useCallback(
		(candidate: string): candidate is Themes | "system" =>
			themes.includes(candidate as Themes) || (enableSystem && candidate === "system"),
		[themes, enableSystem],
	);

	const onThemeChangeRef = useRef(onThemeChange);
	useEffect(() => {
		onThemeChangeRef.current = onThemeChange;
	});

	const applyToDom = useCallback(
		(resolved: string) => {
			appliedThemeRef.current = applyThemeToDom({
				resolved,
				attribute,
				themes,
				valueMap,
				target,
				disableTransitionOnChange,
				enableColorScheme,
				themeColor,
				themeRoot,
				previous: appliedThemeRef.current,
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
			themeRoot,
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
			applyToDom(
				resolveSelection(
					validForcedTheme,
					sys,
					systemThemeMap as SystemThemeMap<string> | undefined,
				) ?? validForcedTheme,
			);
		} else if (initialTheme && isValidTheme(initialTheme)) {
			setStoreTheme(initialTheme);
			applyToDom(
				resolveSelection(
					initialTheme,
					sys,
					systemThemeMap as SystemThemeMap<string> | undefined,
				) ?? "light",
			);
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
			applyToDom(
				resolveSelection(
					initial,
					sys,
					systemThemeMap as SystemThemeMap<string> | undefined,
				) ?? "light",
			);
		}

		if (!mq) return;
		const handler = (e: MediaQueryListEvent) => {
			const next = e.matches ? "dark" : "light";
			setStoreSystemTheme(next);
			const current = getSnapshot().theme;
			if (current === "system" || current === undefined || followSystem) {
				const followsVariant =
					followSystem && Boolean(systemThemeMap) && !isDirectSystemMap(systemThemeMap);
				if (followSystem && !followsVariant) {
					setStoreTheme("system");
				}
				applyToDom(
					resolveSelection(
						followsVariant
							? (current ?? resolvedDefault)
							: followSystem
								? "system"
								: (current ?? "system"),
						next,
						systemThemeMap as SystemThemeMap<string> | undefined,
					) ?? next,
				);
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
		systemThemeMap,
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
			const selection = validForcedTheme ?? theme;
			const resolved = selection
				? resolveSelection(
					selection,
					systemTheme,
					systemThemeMap as SystemThemeMap<string> | undefined,
				)
				: undefined;
			if (resolved) applyToDom(resolved);
		};
		domWindow.addEventListener("pageshow", handler);
		domWindow.addEventListener("popstate", handler);
		return () => {
			domWindow.removeEventListener("pageshow", handler);
			domWindow.removeEventListener("popstate", handler);
		};
	}, [applyToDom, validForcedTheme, getSnapshot, systemThemeMap]);

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		if (storage === "none" || storage === "sessionStorage" || storage === "cookie") return;

		const handler = (e: StorageEvent) => {
			if (e.storageArea !== localStorage || e.key !== storageKey) return;
			const newTheme = e.newValue ?? resolvedDefault;
			if (!isValidTheme(newTheme)) return;
			const resolved = resolveSelection(
				newTheme,
				getSnapshot().systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			);
			setStoreTheme(newTheme);
			if (!validForcedTheme && resolved) applyToDom(resolved);
		};
		domWindow.addEventListener("storage", handler);
		return () => domWindow.removeEventListener("storage", handler);
	}, [
		storage,
		storageKey,
		resolvedDefault,
		isValidTheme,
		systemThemeMap,
		validForcedTheme,
		applyToDom,
		getSnapshot,
		setStoreTheme,
	]);

	useEffect(() => {
		if (storage === "none") return;
		return subscribeThemeChannel(channel, (newTheme) => {
			if (!isValidTheme(newTheme)) return;
			setStoreTheme(newTheme);
			const resolved = resolveSelection(
				newTheme,
				getSnapshot().systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			);
			if (!validForcedTheme && resolved) applyToDom(resolved);
		});
	}, [
		storage,
		channel,
		isValidTheme,
		systemThemeMap,
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
			const resolved = resolveSelection(
				newTheme,
				getSnapshot().systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			);

			setStoreTheme(newTheme);
			if (resolved) applyToDom(resolved);
			onThemeChangeRef.current?.(newTheme as Themes);

			writeStoredTheme(storage, storageKey, newTheme, cookieOptions, onStorageError);
			if (storage !== "none") publishThemeChannel(channel, newTheme);
		},
		[
			applyToDom,
			cookieOptions,
			validForcedTheme,
			storage,
			storageKey,
			onStorageError,
			channel,
			isValidTheme,
			systemThemeMap,
			getSnapshot,
			setStoreTheme,
		],
	);

	const contextValue: ThemeContextValue<string> = {
		theme: validForcedTheme ?? theme,
		resolvedTheme,
		systemTheme,
		forcedTheme: validForcedTheme,
		themes,
		setTheme: setTheme as ThemeContextValue<string>["setTheme"],
	};
	const ContextProvider = themeContext.Provider;

	return <ContextProvider value={contextValue}>{children}</ContextProvider>;
}
