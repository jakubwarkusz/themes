"use client";

import { type ReactElement, useEffect, useMemo, useRef } from "react";
import { ThemeContext } from "../core/context.js";
import { type AppliedThemeState, applyExtendedThemeToDom } from "../core/extended-client-dom.js";
import type { ExtendedThemeProviderProps, SystemThemeMap } from "../core/extended-types.js";
import { publishThemeChannel, subscribeThemeChannel } from "../core/sync.js";
import { isThemeSelection } from "../core/theme-validation.js";
import type { Attribute, DefaultTheme, ThemeContextValue } from "../core/types.js";
import { useEffectEvent } from "../core/use-effect-event.js";
import { type ClientThemeStableConfig, useClientThemeRuntime } from "./client-theme-runtime.js";

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
	themes,
	forcedTheme,
	enableSystem = true,
	defaultTheme,
	attribute = "class",
	value: valueMap,
	target = "html",
	disableTransitionOnChange = false,
	storage,
	storageKey = "theme",
	enableColorScheme = true,
	themeColor,
	followSystem,
	onThemeChange,
	initialTheme,
	cookieOptions,
	onStorageError,
	enableSameDocumentSync = false,
	systemThemeMap,
	themeRoot,
}: ExtendedThemeProviderProps<Themes>): ReactElement {
	const appliedThemeRef = useRef<AppliedThemeState | undefined>(undefined);
	const channel = `${storage ?? "localStorage"}:${storageKey}:${target}`;

	const {
		theme,
		systemTheme,
		resolvedTheme,
		validForcedTheme,
		stableThemes,
		setTheme,
		getSnapshot,
		setStoreTheme,
		applyResolved,
	} = useClientThemeRuntime<Themes, LastAppliedTheme>({
		themes,
		forcedTheme,
		enableSystem,
		defaultTheme,
		value: valueMap,
		storage,
		storageKey,
		followSystem,
		onThemeChange,
		initialTheme,
		cookieOptions,
		onStorageError,
		themeColor,
		keepSystemSelection: !!systemThemeMap && !isDirectSystemMap(systemThemeMap),
		resolveTheme: (selection, systemThemeValue) =>
			resolveSelection(
				selection,
				systemThemeValue,
				systemThemeMap as SystemThemeMap<string> | undefined,
			),
		createLast: (resolved, config: ClientThemeStableConfig) => ({
			resolved,
			attribute,
			themes: config.themes,
			valueMap: config.valueMap,
			target,
			disableTransitionOnChange,
			enableColorScheme,
			themeColor: config.themeColor,
			themeRoot,
		}),
		sameLast: (last, resolved, config) =>
			last.resolved === resolved &&
			last.attribute === attribute &&
			last.themes === config.themes &&
			last.valueMap === config.valueMap &&
			last.target === target &&
			last.disableTransitionOnChange === disableTransitionOnChange &&
			last.enableColorScheme === enableColorScheme &&
			last.themeColor === config.themeColor &&
			last.themeRoot === themeRoot,
		applyLast: (last) => {
			appliedThemeRef.current = applyExtendedThemeToDom({
				...last,
				previous: appliedThemeRef.current,
			});
		},
		afterSetTheme: (newTheme) => {
			if (enableSameDocumentSync && storage !== "none") {
				publishThemeChannel(channel, newTheme);
			}
		},
	});

	const applyChannelThemeEvent = useEffectEvent((newTheme: string) => {
		if (!isThemeSelection(newTheme, themes, enableSystem)) return;
		setStoreTheme(newTheme);
		const resolved = resolveSelection(
			newTheme,
			getSnapshot().systemTheme,
			systemThemeMap as SystemThemeMap<string> | undefined,
		);
		if (!validForcedTheme && resolved) applyResolved(resolved);
	});

	// oxlint-disable-next-line react-hooks/exhaustive-deps -- effect events are intentionally non-reactive.
	useEffect(() => {
		if (!enableSameDocumentSync || storage === "none") return;
		return subscribeThemeChannel(channel, applyChannelThemeEvent);
	}, [enableSameDocumentSync, storage, channel]);

	const contextValue = useMemo(
		(): ThemeContextValue<string> => ({
			theme: validForcedTheme ?? theme,
			resolvedTheme,
			systemTheme,
			forcedTheme: validForcedTheme,
			themes: stableThemes,
			setTheme: setTheme as ThemeContextValue<string>["setTheme"],
		}),
		[validForcedTheme, theme, resolvedTheme, systemTheme, stableThemes, setTheme],
	);

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
