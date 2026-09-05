"use client";

import {
	type ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useSyncExternalStore,
} from "react";
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
import { isThemeSelection, resolveDefaultTheme } from "../core/theme-validation.js";
import type { DefaultTheme, ThemeContextValue } from "../core/types.js";
import { useEffectEvent } from "../core/use-effect-event.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

type LastAppliedTheme = {
	resolved: string;
	attribute: ExtendedThemeProviderProps["attribute"];
	themes: readonly string[];
	valueMap: ExtendedThemeProviderProps["value"];
	target: string;
	disableTransitionOnChange: boolean | string;
	enableColorScheme: boolean;
	themeColor: ExtendedThemeProviderProps["themeColor"];
	themeRoot: ExtendedThemeProviderProps["themeRoot"];
};

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
	const resolvedDefault = resolveDefaultTheme(themes, enableSystem, defaultTheme);

	const storeRef = useRef<ReturnType<typeof createThemeStore> | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createThemeStore();
	}
	const store = storeRef.current;
	const appliedThemeRef = useRef<AppliedThemeState | undefined>(undefined);
	const lastAppliedRef = useRef<LastAppliedTheme | null>(null);
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

	const onThemeChangeEvent = useEffectEvent((next: Themes) => {
		onThemeChange?.(next);
	});

	const applyToDomEvent = useEffectEvent((resolved: string) => {
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
		lastAppliedRef.current = {
			resolved,
			attribute,
			themes,
			valueMap,
			target,
			disableTransitionOnChange,
			enableColorScheme,
			themeColor,
			themeRoot,
		};
	});

	const initializeEvent = useEffectEvent(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		const mq =
			enableSystem && typeof domWindow.matchMedia === "function"
				? domWindow.matchMedia("(prefers-color-scheme: dark)")
				: null;
		const system = mq ? (mq.matches ? "dark" : "light") : undefined;
		let initial: Themes | "system";

		// Forced theme short-circuits init and must not persist to storage.
		if (validForcedTheme) {
			initial = validForcedTheme;
		} else if (initialTheme && isThemeSelection(initialTheme, themes, enableSystem)) {
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
				!followSystem && stored && isThemeSelection(stored, themes, enableSystem)
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
			if (followSystem && !followsVariant) setStoreTheme("system");
			const resolved =
				resolveSelection(
					followsVariant
						? (current ?? resolvedDefault)
						: followSystem
							? "system"
							: (current ?? "system"),
					next,
					systemThemeMap as SystemThemeMap<string> | undefined,
				) ?? next;
			applyToDomEvent(resolved);
			onThemeChangeEvent(next as Themes);
		}
	});

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- applyToDomEvent is an effect event.
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
			if (!isThemeSelection(newTheme, themes, enableSystem)) return;
			const resolved = resolveSelection(
				newTheme,
				getSnapshot().systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			);

			setStoreTheme(newTheme);
			// oxlint-disable-next-line react-hooks/rules-of-hooks -- shared apply path; setTheme stays a public callback.
			if (resolved) applyToDomEvent(resolved);
			onThemeChange?.(newTheme as Themes);
			writeStoredTheme(storage, storageKey, newTheme, cookieOptions, onStorageError);
			if (enableSameDocumentSync && storage !== "none")
				publishThemeChannel(channel, newTheme);
		},
		[
			validForcedTheme,
			themes,
			enableSystem,
			systemThemeMap,
			storage,
			storageKey,
			cookieOptions,
			onStorageError,
			channel,
			enableSameDocumentSync,
			getSnapshot,
			setStoreTheme,
			onThemeChange,
		],
	);

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		initializeEvent();
	}, []);

	// setTheme / system / storage already write the DOM. Re-apply only when
	// resolvedTheme or DOM config changed from outside those paths.
	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		if (!resolvedTheme) return;
		const last = lastAppliedRef.current;
		if (
			last !== null &&
			last.resolved === resolvedTheme &&
			last.attribute === attribute &&
			last.themes === themes &&
			last.valueMap === valueMap &&
			last.target === target &&
			last.disableTransitionOnChange === disableTransitionOnChange &&
			last.enableColorScheme === enableColorScheme &&
			last.themeColor === themeColor &&
			last.themeRoot === themeRoot
		) {
			return;
		}
		applyToDomEvent(resolvedTheme);
	}, [
		resolvedTheme,
		attribute,
		themes,
		valueMap,
		target,
		disableTransitionOnChange,
		enableColorScheme,
		themeColor,
		themeRoot,
	]);

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
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

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		const handler = () => {
			const { theme: currentTheme, systemTheme: currentSystemTheme } = getSnapshot();
			const selection = validForcedTheme ?? currentTheme;
			const resolved = selection
				? resolveSelection(
						selection,
						currentSystemTheme,
						systemThemeMap as SystemThemeMap<string> | undefined,
					)
				: undefined;
			if (resolved) applyToDomEvent(resolved);
		};
		domWindow.addEventListener("pageshow", handler);
		domWindow.addEventListener("popstate", handler);
		return () => {
			domWindow.removeEventListener("pageshow", handler);
			domWindow.removeEventListener("popstate", handler);
		};
	}, [validForcedTheme, getSnapshot, systemThemeMap]);

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		if (storage === "none" || storage === "sessionStorage" || storage === "cookie") return;

		const handler = (event: StorageEvent) => {
			if (event.storageArea !== localStorage || event.key !== storageKey) return;
			const newTheme = event.newValue ?? resolvedDefault;
			if (!isThemeSelection(newTheme, themes, enableSystem)) return;
			const resolved = resolveSelection(
				newTheme,
				getSnapshot().systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			);
			setStoreTheme(newTheme);
			if (!validForcedTheme && resolved) applyToDomEvent(resolved);
		};
		domWindow.addEventListener("storage", handler);
		return () => domWindow.removeEventListener("storage", handler);
	}, [
		storage,
		storageKey,
		resolvedDefault,
		themes,
		enableSystem,
		systemThemeMap,
		validForcedTheme,
		getSnapshot,
		setStoreTheme,
	]);

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		if (!enableSameDocumentSync || storage === "none") return;
		return subscribeThemeChannel(channel, (newTheme) => {
			if (!isThemeSelection(newTheme, themes, enableSystem)) return;
			setStoreTheme(newTheme);
			const resolved = resolveSelection(
				newTheme,
				getSnapshot().systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			);
			if (!validForcedTheme && resolved) applyToDomEvent(resolved);
		});
	}, [
		enableSameDocumentSync,
		storage,
		channel,
		themes,
		enableSystem,
		systemThemeMap,
		validForcedTheme,
		getSnapshot,
		setStoreTheme,
	]);

	const contextValue = useMemo(
		(): ThemeContextValue<string> => ({
			theme: validForcedTheme ?? theme,
			resolvedTheme,
			systemTheme,
			forcedTheme: validForcedTheme,
			themes,
			setTheme: setTheme as ThemeContextValue<string>["setTheme"],
		}),
		[validForcedTheme, theme, resolvedTheme, systemTheme, themes, setTheme],
	);

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
