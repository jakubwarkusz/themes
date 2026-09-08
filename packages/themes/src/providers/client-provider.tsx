"use client";

import {
	type ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useSyncExternalStore,
} from "react";
import {
	applyThemeToDom,
	getDomWindow,
	readStoredTheme,
	writeStoredTheme,
} from "../core/client-dom.js";
import {
	holdIfEqual,
	sameStringList,
	sameStringRecord,
	sameThemeColor,
} from "../core/config-equal.js";
import { ThemeContext, type ThemeContextInstance } from "../core/context.js";
import { subscribeHistoryReapply } from "../core/history-reapply.js";
import { createThemeStore } from "../core/store.js";
import { isThemeSelection, resolveDefaultTheme } from "../core/theme-validation.js";
import type {
	Attribute,
	DefaultTheme,
	ResolvedTheme,
	ThemeContextValue,
	ThemeProviderProps,
} from "../core/types.js";
import { useEffectEvent } from "../core/use-effect-event.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

type LastAppliedTheme = {
	resolved: string;
	attribute: Attribute | readonly Attribute[];
	themes: readonly string[];
	valueMap: ThemeProviderProps["value"];
	target: string;
	disableTransitionOnChange: boolean | string;
	enableColorScheme: boolean;
	themeColor: ThemeProviderProps["themeColor"];
};

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
	const lastAppliedRef = useRef<LastAppliedTheme | null>(null);
	const themesRef = useRef(themes);
	themesRef.current = holdIfEqual(themesRef.current, themes, sameStringList);
	const stableThemes = themesRef.current;
	const valueMapRef = useRef(valueMap);
	valueMapRef.current = holdIfEqual(valueMapRef.current, valueMap, sameStringRecord);
	const stableValueMap = valueMapRef.current;
	const themeColorRef = useRef(themeColor);
	themeColorRef.current = holdIfEqual(themeColorRef.current, themeColor, sameThemeColor);
	const stableThemeColor = themeColorRef.current;

	const validForcedTheme =
		forcedTheme && stableThemes.includes(forcedTheme) ? forcedTheme : undefined;
	const selectedTheme = validForcedTheme ?? theme;
	const resolvedTheme: ResolvedTheme<Themes> | undefined =
		selectedTheme === "system" || selectedTheme === undefined
			? (systemTheme as ResolvedTheme<Themes> | undefined)
			: (selectedTheme as ResolvedTheme<Themes>);

	const onThemeChangeEvent = useEffectEvent((next: Themes) => {
		onThemeChange?.(next);
	});

	const applyToDomEvent = useEffectEvent((resolved: string) => {
		const last: LastAppliedTheme = {
			resolved,
			attribute,
			themes: stableThemes,
			valueMap: stableValueMap,
			target,
			disableTransitionOnChange,
			enableColorScheme,
			themeColor: stableThemeColor,
		};
		applyThemeToDom(last);
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
			if (followSystem) {
				setStoreTheme("system");
			}
			applyToDomEvent(next);
			onThemeChangeEvent(next as Themes);
		}
	});
	// Public API: must be a regular callback (not an Effect Event) so consumers can
	// call it from event handlers and receive it via context under oxlint rules.
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
			if (!isThemeSelection(newTheme, stableThemes, enableSystem)) return;
			const resolved =
				newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;

			setStoreTheme(newTheme);
			// oxlint-disable-next-line react-hooks/rules-of-hooks -- shared apply path; setTheme stays a public callback.
			applyToDomEvent(resolved);
			onThemeChange?.(newTheme as Themes);

			writeStoredTheme(storage, storageKey, newTheme, cookieOptions, onStorageError);
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
			if (last) applyThemeToDom(last);
		});
	}, []);

	// setTheme / system / storage already write the DOM. Re-apply only when
	// resolvedTheme or DOM config changed from outside those paths.
	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		if (!resolvedTheme) return;
		const last = lastAppliedRef.current;
		if (
			last &&
			last.resolved === resolvedTheme &&
			last.attribute === attribute &&
			last.themes === stableThemes &&
			last.valueMap === stableValueMap &&
			last.target === target &&
			last.disableTransitionOnChange === disableTransitionOnChange &&
			last.enableColorScheme === enableColorScheme &&
			last.themeColor === stableThemeColor
		) {
			return;
		}
		applyToDomEvent(resolvedTheme);
	}, [
		resolvedTheme,
		attribute,
		stableThemes,
		stableValueMap,
		target,
		disableTransitionOnChange,
		enableColorScheme,
		stableThemeColor,
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
		if (
			followSystem ||
			storage === "none" ||
			storage === "sessionStorage" ||
			storage === "cookie"
		)
			return;

		const handler = (e: StorageEvent) => {
			if (e.storageArea !== localStorage || e.key !== storageKey) return;
			const newTheme = e.newValue ?? resolvedDefault;
			if (!isThemeSelection(newTheme, themes, enableSystem)) return;
			const resolved =
				newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;
			setStoreTheme(newTheme);
			if (!validForcedTheme) applyToDomEvent(resolved);
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

	const contextTheme =
		theme !== undefined && isThemeSelection(theme, themes, enableSystem)
			? (theme as Themes | "system")
			: undefined;
	const contextValue = useMemo(
		(): ThemeContextValue<Themes> => ({
			theme: validForcedTheme ?? contextTheme,
			resolvedTheme,
			systemTheme,
			forcedTheme: validForcedTheme,
			themes: stableThemes,
			setTheme,
		}),
		[validForcedTheme, contextTheme, resolvedTheme, systemTheme, stableThemes, setTheme],
	);
	const ContextProvider = themeContext.Provider;

	return <ContextProvider value={contextValue}>{children}</ContextProvider>;
}
