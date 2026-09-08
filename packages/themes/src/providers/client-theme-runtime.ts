"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import {
	holdIfEqual,
	sameStringList,
	sameStringRecord,
	sameThemeColor,
} from "../core/config-equal.js";
import { subscribeHistoryReapply } from "../core/history-reapply.js";
import { createThemeStore, type ThemeStore } from "../core/store.js";
import { getDomWindow, readStoredTheme, writeStoredTheme } from "../core/theme-storage.js";
import { isThemeSelection, resolveDefaultTheme } from "../core/theme-validation.js";
import type {
	CookieOptions,
	DefaultTheme,
	StorageType,
	ThemeColor,
	ThemeSelection,
	ThemeValueObject,
} from "../core/types.js";
import { useEffectEvent } from "../core/use-effect-event.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];
const NOOP = () => {};

export type ClientThemeStableConfig = {
	themes: readonly string[];
	valueMap: ThemeValueObject | undefined;
	themeColor: ThemeColor | undefined;
};

export type ClientThemeRuntimeConfig<Themes extends string = DefaultTheme, Last = unknown> = {
	themes?: readonly Themes[] | undefined;
	forcedTheme?: Themes | undefined;
	enableSystem?: boolean | undefined;
	defaultTheme?: Themes | "system" | undefined;
	value?: ThemeValueObject<Themes> | undefined;
	storage?: StorageType | undefined;
	storageKey?: string | undefined;
	followSystem?: boolean | undefined;
	onThemeChange?: ((theme: ThemeSelection<Themes>) => void) | undefined;
	initialTheme?: ThemeSelection<Themes> | undefined;
	cookieOptions?: CookieOptions | undefined;
	onStorageError?: ((error: unknown) => void) | undefined;
	themeColor?: ThemeColor<Themes> | undefined;
	keepSystemSelection?: boolean | undefined;
	resolveTheme: (
		selection: string,
		systemTheme: "light" | "dark" | undefined,
	) => string | undefined;
	createLast: (resolved: string, config: ClientThemeStableConfig) => Last;
	sameLast: (last: Last, resolved: string, config: ClientThemeStableConfig) => boolean;
	applyLast: (last: Last) => void;
	afterSetTheme?: ((newTheme: string) => void) | undefined;
};

export type ClientThemeRuntime<Themes extends string> = {
	theme: string | undefined;
	systemTheme: "light" | "dark" | undefined;
	resolvedTheme: string | undefined;
	validForcedTheme: Themes | undefined;
	stableThemes: readonly string[];
	stableValueMap: ThemeValueObject | undefined;
	stableThemeColor: ThemeColor | undefined;
	setTheme: (
		next: Themes | "system" | ((current: Themes | "system" | undefined) => Themes | "system"),
	) => void;
	getSnapshot: ThemeStore["getSnapshot"];
	setStoreTheme: ThemeStore["setTheme"];
	applyResolved: (resolved: string) => void;
};

export function useClientThemeRuntime<Themes extends string, Last>(
	config: ClientThemeRuntimeConfig<Themes, Last>,
): ClientThemeRuntime<Themes> {
	const {
		themes = DEFAULT_THEMES as Themes[],
		forcedTheme,
		enableSystem = true,
		defaultTheme,
		value: valueMap,
		storage = "localStorage",
		storageKey = "theme",
		followSystem = false,
		onThemeChange,
		initialTheme,
		cookieOptions,
		onStorageError,
		themeColor,
		keepSystemSelection = false,
		resolveTheme,
		createLast,
		sameLast,
		applyLast,
		afterSetTheme = NOOP,
	} = config;

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
	const lastAppliedRef = useRef<Last | null>(null);
	const themesRef = useRef(themes);
	themesRef.current = holdIfEqual(themesRef.current, themes, sameStringList);
	const stableThemes = themesRef.current;
	const valueMapRef = useRef(valueMap);
	valueMapRef.current = holdIfEqual(valueMapRef.current, valueMap, sameStringRecord);
	const stableValueMap = valueMapRef.current;
	const themeColorRef = useRef(themeColor);
	themeColorRef.current = holdIfEqual(themeColorRef.current, themeColor, sameThemeColor);
	const stableThemeColor = themeColorRef.current;
	const stableConfig: ClientThemeStableConfig = {
		themes: stableThemes,
		valueMap: stableValueMap,
		themeColor: stableThemeColor,
	};

	const validForcedTheme =
		forcedTheme && stableThemes.includes(forcedTheme) ? forcedTheme : undefined;
	const selectedTheme = validForcedTheme ?? theme;
	const resolvedTheme = selectedTheme ? resolveTheme(selectedTheme, systemTheme) : undefined;

	const onThemeChangeEvent = useEffectEvent((next: Themes) => {
		onThemeChange?.(next);
	});
	const resolveThemeEvent = useEffectEvent(resolveTheme);
	const createLastEvent = useEffectEvent(createLast);
	const sameLastEvent = useEffectEvent(sameLast);
	const applyLastEvent = useEffectEvent(applyLast);
	const afterSetThemeEvent = useEffectEvent(afterSetTheme);

	const applyResolvedEvent = useEffectEvent((resolved: string) => {
		const last = createLastEvent(resolved, stableConfig);
		applyLastEvent(last);
		lastAppliedRef.current = last;
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
			const keepSelection = followSystem && keepSystemSelection;
			if (followSystem && !keepSelection) {
				setStoreTheme("system");
			}
			const selection = keepSelection
				? (current ?? resolvedDefault)
				: followSystem
					? "system"
					: (current ?? "system");
			const resolved = resolveThemeEvent(selection, next) ?? next;
			applyResolvedEvent(resolved);
			onThemeChangeEvent(next as Themes);
		}
	});

	// Public API: must be a regular callback (not an Effect Event) so consumers can
	// call it from event handlers and receive it via context under oxlint rules.
	// oxlint-disable-next-line react-hooks/exhaustive-deps -- applyResolvedEvent is an effect event.
	const setTheme = useCallback(
		(
			next:
				| Themes
				| "system"
				| ((current: Themes | "system" | undefined) => Themes | "system"),
		): void => {
			if (validForcedTheme) return;

			const current = getSnapshot().theme as Themes | "system" | undefined;
			const newTheme = typeof next === "function" ? next(current) : next;
			if (!isThemeSelection(newTheme, stableThemes, enableSystem)) return;
			const resolved =
				// oxlint-disable-next-line react-hooks/rules-of-hooks -- shared apply path; setTheme stays a public callback.
				resolveThemeEvent(newTheme, getSnapshot().systemTheme) ??
				(newTheme === "system" ? "light" : newTheme);

			setStoreTheme(newTheme);
			// oxlint-disable-next-line react-hooks/rules-of-hooks -- shared apply path; setTheme stays a public callback.
			applyResolvedEvent(resolved);
			onThemeChange?.(newTheme as Themes);

			writeStoredTheme(storage, storageKey, newTheme, cookieOptions, onStorageError);
			// oxlint-disable-next-line react-hooks/rules-of-hooks -- shared apply path; setTheme stays a public callback.
			afterSetThemeEvent(newTheme);
		},
		[
			validForcedTheme,
			stableThemes,
			enableSystem,
			storage,
			storageKey,
			cookieOptions,
			onStorageError,
			getSnapshot,
			setStoreTheme,
			onThemeChange,
		],
	);

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		initializeEvent();
		const domWindow = getDomWindow();
		if (!domWindow) return;
		return subscribeHistoryReapply(domWindow, () => {
			const last = lastAppliedRef.current;
			if (last) applyLastEvent(last);
		});
	}, []);

	// setTheme / system / storage already write the DOM. Re-apply only when
	// resolvedTheme or DOM config changed from outside those paths.
	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		if (!resolvedTheme) return;
		const last = lastAppliedRef.current;
		if (last && sameLastEvent(last, resolvedTheme, stableConfig)) return;
		applyResolvedEvent(resolvedTheme);
	});

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
		if (
			followSystem ||
			storage === "none" ||
			storage === "sessionStorage" ||
			storage === "cookie"
		)
			return;

		const handler = (event: StorageEvent) => {
			if (event.storageArea !== localStorage || event.key !== storageKey) return;
			const newTheme = event.newValue ?? resolvedDefault;
			if (!isThemeSelection(newTheme, themes, enableSystem)) return;
			const resolved = resolveThemeEvent(newTheme, getSnapshot().systemTheme);
			setStoreTheme(newTheme);
			if (!validForcedTheme && resolved) applyResolvedEvent(resolved);
		};
		domWindow.addEventListener("storage", handler);
		return () => domWindow.removeEventListener("storage", handler);
	}, [
		followSystem,
		storage,
		storageKey,
		resolvedDefault,
		themes,
		enableSystem,
		validForcedTheme,
		getSnapshot,
		setStoreTheme,
	]);

	// oxlint-disable-next-line react-hooks/rules-of-hooks -- callers outside effects still need the latest apply.
	const applyResolved = applyResolvedEvent;

	return {
		theme,
		systemTheme,
		resolvedTheme,
		validForcedTheme,
		stableThemes,
		stableValueMap,
		stableThemeColor,
		setTheme,
		getSnapshot,
		setStoreTheme,
		applyResolved,
	};
}
