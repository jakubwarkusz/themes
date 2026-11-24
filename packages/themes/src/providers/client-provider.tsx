"use client";

import {
	type ReactElement,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useSyncExternalStore,
} from "react";
import {
	applyThemeToDom,
	getDomWindow,
	getTargetEl,
	readStoredTheme,
	writeStoredTheme,
} from "../core/client-dom.js";
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
import { useCommittedCallback, useEffectEvent } from "../core/use-effect-event.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];
const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

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

	const validForcedTheme = forcedTheme && themes.includes(forcedTheme) ? forcedTheme : undefined;
	const selectedTheme = validForcedTheme ?? theme;
	const resolvedTheme: ResolvedTheme<Themes> | undefined =
		selectedTheme === "system" || selectedTheme === undefined
			? (systemTheme as ResolvedTheme<Themes> | undefined)
			: (selectedTheme as ResolvedTheme<Themes>);

	const applyToDom = useCommittedCallback((resolved: string) => {
		const last: LastAppliedTheme = {
			resolved,
			attribute,
			themes,
			valueMap,
			target,
			disableTransitionOnChange,
			enableColorScheme,
			themeColor,
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
		const { theme: current, systemTheme: previousSystem } = getSnapshot();
		let initial = resolvedDefault;

		if (
			current === undefined &&
			initialTheme &&
			isThemeSelection(initialTheme, themes, enableSystem)
		) {
			initial = initialTheme;
			if (!validForcedTheme)
				writeStoredTheme(storage, storageKey, initialTheme, cookieOptions, onStorageError);
		} else if (
			followSystem &&
			!validForcedTheme &&
			system &&
			previousSystem &&
			system !== previousSystem
		) {
			initial = "system";
		} else {
			const selection =
				followSystem || storage === "none"
					? current
					: readStoredTheme(storage, storageKey, onStorageError);
			if (selection && isThemeSelection(selection, themes, enableSystem))
				initial = selection as Themes | "system";
		}

		setStoreState({ theme: initial, systemTheme: system });
	});
	const handleSystemChangeEvent = useEffectEvent((next: "light" | "dark") => {
		setStoreSystemTheme(next);
		if (validForcedTheme) return;
		const current = getSnapshot().theme;
		if (current === "system" || current === undefined || followSystem) {
			if (followSystem) {
				setStoreTheme("system");
			}
			applyToDom(next);
			onThemeChange?.(next as Themes);
		}
	});
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
			const resolved =
				newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;

			setStoreTheme(newTheme);
			applyToDom(resolved);
			writeStoredTheme(storage, storageKey, newTheme, cookieOptions, onStorageError);
			onThemeChange?.(newTheme as Themes);
		},
		[
			validForcedTheme,
			themes,
			enableSystem,
			storage,
			storageKey,
			cookieOptions,
			onStorageError,
			getSnapshot,
			setStoreTheme,
			onThemeChange,
			applyToDom,
		],
	);

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		lastAppliedRef.current = null;
		initializeEvent();
	}, []);

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		return subscribeHistoryReapply(
			domWindow,
			() => {
				const last = lastAppliedRef.current;
				if (last) applyThemeToDom(last);
			},
			() => getTargetEl(lastAppliedRef.current?.target ?? "html"),
			attribute,
		);
	}, [attribute]);

	useIsomorphicLayoutEffect(() => {
		const last = lastAppliedRef.current;
		if (last) applyThemeToDom(last);
	}, []);

	// setTheme / system / storage already write the DOM. Re-apply only when
	// resolvedTheme or DOM config changed from outside those paths.
	useEffect(() => {
		if (!resolvedTheme) return;
		const last = lastAppliedRef.current;
		if (
			last &&
			last.resolved === resolvedTheme &&
			last.attribute === attribute &&
			last.themes === themes &&
			last.valueMap === valueMap &&
			last.target === target &&
			last.disableTransitionOnChange === disableTransitionOnChange &&
			last.enableColorScheme === enableColorScheme &&
			last.themeColor === themeColor
		) {
			return;
		}
		applyToDom(resolvedTheme);
	}, [
		resolvedTheme,
		attribute,
		themes,
		valueMap,
		target,
		disableTransitionOnChange,
		enableColorScheme,
		themeColor,
		applyToDom,
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

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow || followSystem || (storage !== "localStorage" && storage !== "hybrid"))
			return;

		const handler = (e: StorageEvent) => {
			if ((e.key !== null && e.key !== storageKey) || e.storageArea !== localStorage) return;
			const newTheme = e.newValue ?? resolvedDefault;
			if (!isThemeSelection(newTheme, themes, enableSystem)) return;
			const resolved =
				newTheme === "system" ? (getSnapshot().systemTheme ?? "light") : newTheme;
			setStoreTheme(newTheme);
			if (!validForcedTheme) applyToDom(resolved);
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
		applyToDom,
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
			themes,
			setTheme,
		}),
		[validForcedTheme, contextTheme, resolvedTheme, systemTheme, themes, setTheme],
	);
	const ContextProvider = themeContext.Provider;

	return <ContextProvider value={contextValue}>{children}</ContextProvider>;
}
