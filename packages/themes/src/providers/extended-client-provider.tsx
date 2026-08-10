"use client";

import { type ReactElement, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { ThemeContext } from "../core/context.js";
import {
	type AppliedThemeState,
	applyExtendedThemeToDom,
	getDomWindow,
	readStoredTheme,
	writeStoredTheme,
} from "../core/extended-client-dom.js";
import type { ExtendedThemeProviderProps, SystemThemeMap } from "../core/extended-types.js";
import { createThemeStore } from "../core/store.js";
import { publishThemeChannel, subscribeThemeChannel } from "../core/sync.js";
import { isThemeSelection } from "../core/theme-validation.js";
import type { DefaultTheme, ThemeContextValue } from "../core/types.js";

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

export function ExtendedClientThemeProvider<Themes extends string = DefaultTheme>({
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
	enableSameDocumentSync = false,
	systemThemeMap,
	themeRoot,
}: ExtendedThemeProviderProps<Themes>): ReactElement {
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
			isThemeSelection(candidate, themes, enableSystem),
		[themes, enableSystem],
	);

	const onThemeChangeRef = useRef(onThemeChange);
	useEffect(() => {
		onThemeChangeRef.current = onThemeChange;
	});

	const applyToDom = useCallback(
		(resolved: string) => {
			appliedThemeRef.current = applyExtendedThemeToDom({
				resolved,
				attribute,
				themes,
				valueMap,
				target,
				disableTransitionOnChange,
				enableColorScheme,
				themeColor,
				previous: appliedThemeRef.current,
				...(themeRoot !== undefined ? { themeRoot } : {}),
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
		const mediaQuery =
			enableSystem && typeof domWindow.matchMedia === "function"
				? domWindow.matchMedia("(prefers-color-scheme: dark)")
				: null;
		const nextSystemTheme: "light" | "dark" | undefined = mediaQuery
			? mediaQuery.matches
				? "dark"
				: "light"
			: undefined;
		if (nextSystemTheme) setStoreSystemTheme(nextSystemTheme);

		if (validForcedTheme) {
			setStoreTheme(validForcedTheme);
			applyToDom(
				resolveSelection(
					validForcedTheme,
					nextSystemTheme,
					systemThemeMap as SystemThemeMap<string> | undefined,
				) ?? validForcedTheme,
			);
		} else if (initialTheme && isValidTheme(initialTheme)) {
			setStoreTheme(initialTheme);
			applyToDom(
				resolveSelection(
					initialTheme,
					nextSystemTheme,
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

			setStoreState({ theme: initial, systemTheme: nextSystemTheme });
			applyToDom(
				resolveSelection(
					initial,
					nextSystemTheme,
					systemThemeMap as SystemThemeMap<string> | undefined,
				) ?? "light",
			);
		}

		if (!mediaQuery) return;
		const handleSystemChange = (event: MediaQueryListEvent) => {
			const next = event.matches ? "dark" : "light";
			setStoreSystemTheme(next);
			const current = getSnapshot().theme;
			if (current === "system" || current === undefined || followSystem) {
				const followsVariant =
					followSystem && Boolean(systemThemeMap) && !isDirectSystemMap(systemThemeMap);
				if (followSystem && !followsVariant) setStoreTheme("system");
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
		mediaQuery.addEventListener?.("change", handleSystemChange);
		return () => mediaQuery.removeEventListener?.("change", handleSystemChange);
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

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		const handleNavigation = () => {
			const { theme: currentTheme, systemTheme: currentSystemTheme } = getSnapshot();
			const selection = validForcedTheme ?? currentTheme;
			const resolved = selection
				? resolveSelection(
						selection,
						currentSystemTheme,
						systemThemeMap as SystemThemeMap<string> | undefined,
					)
				: undefined;
			if (resolved) applyToDom(resolved);
		};
		domWindow.addEventListener("pageshow", handleNavigation);
		domWindow.addEventListener("popstate", handleNavigation);
		return () => {
			domWindow.removeEventListener("pageshow", handleNavigation);
			domWindow.removeEventListener("popstate", handleNavigation);
		};
	}, [applyToDom, validForcedTheme, getSnapshot, systemThemeMap]);

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		if (storage === "none" || storage === "sessionStorage" || storage === "cookie") return;

		const handleStorage = (event: StorageEvent) => {
			if (event.storageArea !== localStorage || event.key !== storageKey) return;
			const newTheme = event.newValue ?? resolvedDefault;
			if (!isValidTheme(newTheme)) return;
			const resolved = resolveSelection(
				newTheme,
				getSnapshot().systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			);
			setStoreTheme(newTheme);
			if (!validForcedTheme && resolved) applyToDom(resolved);
		};
		domWindow.addEventListener("storage", handleStorage);
		return () => domWindow.removeEventListener("storage", handleStorage);
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
		if (!enableSameDocumentSync || storage === "none") return;
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
		enableSameDocumentSync,
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
			if (enableSameDocumentSync && storage !== "none")
				publishThemeChannel(channel, newTheme);
		},
		[
			applyToDom,
			cookieOptions,
			validForcedTheme,
			storage,
			storageKey,
			onStorageError,
			channel,
			enableSameDocumentSync,
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

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
