"use client";

import {
	type ReactElement,
	useCallback,
	useEffect,
	useEffectEvent,
	useRef,
	useSyncExternalStore,
} from "react";
import {
	type AppliedThemeState,
	applyThemeToDom,
	getDomWindow,
	readStoredTheme,
	writeStoredTheme,
} from "../core/client-dom.js";
import { ThemeContext, type ThemeContextInstance } from "../core/context.js";
import { createThemeStore } from "../core/store.js";
import { publishThemeChannel } from "../core/sync.js";
import { isThemeSelection, resolveDefaultTheme } from "../core/theme-validation.js";
import type {
	DefaultTheme,
	ResolvedTheme,
	SystemThemeMap,
	ThemeContextValue,
	ThemeProviderProps,
} from "../core/types.js";
import { useThemeExternalSync } from "./use-theme-external-sync.js";

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
	systemThemeMap,
	themeRoot,
	themeContext = ThemeContext as ThemeContextInstance<Themes>,
}: ClientThemeProviderProps<Themes>): ReactElement {
	const resolvedDefault = resolveDefaultTheme(themes, enableSystem, defaultTheme);

	const storeRef = useRef<ReturnType<typeof createThemeStore> | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createThemeStore();
	}
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
	const resolvedTheme: ResolvedTheme<Themes> | undefined = selectedTheme
		? (resolveSelection(
				selectedTheme,
				systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			) as ResolvedTheme<Themes> | undefined)
		: undefined;
	const channel = `${storage ?? "localStorage"}:${storageKey}:${target}`;

	const isValidTheme = useCallback(
		(candidate: string): candidate is Themes | "system" =>
			isThemeSelection(candidate, themes, enableSystem),
		[themes, enableSystem],
	);

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
	const onThemeChangeEvent = useEffectEvent((next: Themes) => {
		onThemeChange?.(next);
	});
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
			const followsVariant =
				followSystem && Boolean(systemThemeMap) && !isDirectSystemMap(systemThemeMap);
			if (followSystem && !followsVariant) {
				setStoreTheme("system");
			}
			applyToDomEvent(
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
			onThemeChangeEvent(next as Themes);
		}
	});

	useThemeExternalSync({
		storage,
		storageKey,
		channel,
		resolvedDefault,
		validForcedTheme,
		systemThemeMap: systemThemeMap as SystemThemeMap<string> | undefined,
		isValidTheme,
		getSnapshot,
		setStoreTheme,
		applyToDom,
		resolveSelection,
	});

	useEffect(() => {
		initializeEvent();
	}, []);

	useEffect(() => {
		if (resolvedTheme) applyToDom(resolvedTheme);
	}, [resolvedTheme, applyToDom]);

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
			onThemeChange?.(newTheme as Themes);

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
			onThemeChange,
			channel,
			isValidTheme,
			systemThemeMap,
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
