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
import { ThemeContext } from "../core/context.js";
import {
	type AppliedThemeState,
	applyExtendedThemeToDom,
	getDomWindow,
	getTargetElement,
	readStoredTheme,
	writeStoredTheme,
} from "../core/extended-client-dom.js";
import { subscribeHistoryReapply } from "../core/history-reapply.js";
import type { ExtendedThemeProviderProps, SystemThemeMap } from "../core/extended-types.js";
import { createThemeStore } from "../core/store.js";
import { publishThemeChannel, subscribeThemeChannel } from "../core/sync.js";
import { isThemeSelection, resolveDefaultTheme } from "../core/theme-validation.js";
import type { Attribute, DefaultTheme, ThemeContextValue } from "../core/types.js";
import { useCommittedCallback, useEffectEvent } from "../core/use-effect-event.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];
const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

type LastAppliedTheme = {
	resolved: string;
	attribute: Attribute | readonly Attribute[];
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
	const followsVariant = followSystem && !!systemThemeMap && !isDirectSystemMap(systemThemeMap);
	const selectedTheme = validForcedTheme ?? theme;
	const resolvedTheme = selectedTheme
		? (resolveSelection(
				selectedTheme,
				systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			) as Themes | undefined)
		: undefined;
	const channel = `${storage}:${storageKey}`;

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
			themeRoot,
		};
		appliedThemeRef.current = applyExtendedThemeToDom({
			...last,
			previous: appliedThemeRef.current,
		});
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
			!followsVariant &&
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
			applyToDom(resolved);
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
			const resolved = resolveSelection(
				newTheme,
				getSnapshot().systemTheme,
				systemThemeMap as SystemThemeMap<string> | undefined,
			);

			setStoreTheme(newTheme);
			if (resolved) applyToDom(resolved);
			writeStoredTheme(storage, storageKey, newTheme, cookieOptions, onStorageError);
			if (enableSameDocumentSync && storage !== "none")
				publishThemeChannel(channel, newTheme);
			onThemeChange?.(newTheme as Themes);
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
				if (last) applyToDom(last.resolved);
			},
			() => {
				const last = lastAppliedRef.current;
				return getTargetElement(last?.target ?? "html", last?.themeRoot);
			},
			attribute,
		);
	}, [applyToDom, attribute]);

	useIsomorphicLayoutEffect(() => {
		const last = lastAppliedRef.current;
		if (last)
			appliedThemeRef.current = applyExtendedThemeToDom({
				...last,
				previous: appliedThemeRef.current,
			});
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
			last.themeColor === themeColor &&
			last.themeRoot === themeRoot
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
		themeRoot,
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

		const handler = (event: StorageEvent) => {
			if (
				(event.key !== null && event.key !== storageKey) ||
				event.storageArea !== localStorage
			)
				return;
			const newTheme = event.newValue ?? resolvedDefault;
			if (!isThemeSelection(newTheme, themes, enableSystem)) return;
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
		followSystem,
		storage,
		storageKey,
		resolvedDefault,
		themes,
		enableSystem,
		systemThemeMap,
		validForcedTheme,
		getSnapshot,
		setStoreTheme,
		applyToDom,
	]);

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
			if (!validForcedTheme && resolved) applyToDom(resolved);
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
		applyToDom,
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
