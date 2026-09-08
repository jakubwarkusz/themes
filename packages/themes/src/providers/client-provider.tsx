"use client";

import { type ReactElement, useMemo } from "react";
import { applyThemeToDom } from "../core/client-dom.js";
import { ThemeContext, type ThemeContextInstance } from "../core/context.js";
import { isThemeSelection } from "../core/theme-validation.js";
import type {
	Attribute,
	DefaultTheme,
	ResolvedTheme,
	ThemeContextValue,
	ThemeProviderProps,
} from "../core/types.js";
import { type ClientThemeStableConfig, useClientThemeRuntime } from "./client-theme-runtime.js";

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
	themes,
	forcedTheme,
	enableSystem = true,
	defaultTheme,
	attribute = "class",
	value: valueMap,
	target = "html",
	disableTransitionOnChange = false,
	storage,
	storageKey,
	enableColorScheme = true,
	themeColor,
	followSystem,
	onThemeChange,
	initialTheme,
	cookieOptions,
	onStorageError,
	themeContext = ThemeContext as ThemeContextInstance<Themes>,
}: ClientThemeProviderProps<Themes>): ReactElement {
	const { theme, systemTheme, resolvedTheme, validForcedTheme, stableThemes, setTheme } =
		useClientThemeRuntime<Themes, LastAppliedTheme>({
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
			resolveTheme: (selection, systemThemeValue) =>
				selection === "system" ? systemThemeValue : selection,
			createLast: (resolved, config: ClientThemeStableConfig) => ({
				resolved,
				attribute,
				themes: config.themes,
				valueMap: config.valueMap,
				target,
				disableTransitionOnChange,
				enableColorScheme,
				themeColor: config.themeColor,
			}),
			sameLast: (last, resolved, config) =>
				last.resolved === resolved &&
				last.attribute === attribute &&
				last.themes === config.themes &&
				last.valueMap === config.valueMap &&
				last.target === target &&
				last.disableTransitionOnChange === disableTransitionOnChange &&
				last.enableColorScheme === enableColorScheme &&
				last.themeColor === config.themeColor,
			applyLast: (last) => {
				applyThemeToDom(last);
			},
		});

	const contextTheme =
		theme !== undefined && isThemeSelection(theme, stableThemes, enableSystem)
			? (theme as Themes | "system")
			: undefined;
	const contextValue = useMemo(
		(): ThemeContextValue<Themes> => ({
			theme: validForcedTheme ?? contextTheme,
			resolvedTheme: resolvedTheme as ResolvedTheme<Themes> | undefined,
			systemTheme,
			forcedTheme: validForcedTheme,
			themes: stableThemes as readonly Themes[],
			setTheme,
		}),
		[validForcedTheme, contextTheme, resolvedTheme, systemTheme, stableThemes, setTheme],
	);
	const ContextProvider = themeContext.Provider;

	return <ContextProvider value={contextValue}>{children}</ContextProvider>;
}
