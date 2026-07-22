"use client";

import {
	type DependencyList,
	type EffectCallback,
	type ReactElement,
	useEffect,
	useRef,
} from "react";
import type { ThemedImageProps } from "../components/themed-image.js";
import { ThemedImage } from "../components/themed-image.js";
import { createThemeContext, useThemeFromContext } from "../core/context.js";
import { resolveThemeValue, type ThemeValueMap } from "../core/theme-value.js";
import type {
	ResolvedTheme,
	ThemeContextValue,
	ThemeProviderProps,
	ThemeSelection,
} from "../core/types.js";
import { ClientThemeProvider } from "../providers/client-provider.js";

export type { ThemeValueMap } from "../core/theme-value.js";

export type TypedThemedImageProps<Themes extends string> = ThemedImageProps<Themes>;

export type CreateThemesConfig<Themes extends readonly string[]> = Omit<
	ThemeProviderProps<Themes[number]>,
	"children" | "themes"
> & {
	themes: Themes;
};

export type CreateThemesResult<Themes extends readonly string[]> = {
	ThemeProvider: (props: Omit<ThemeProviderProps<Themes[number]>, "themes">) => ReactElement;
	useTheme: () => ThemeContextValue<Themes[number]>;
	useThemeValue: <Value>(map: ThemeValueMap<Themes[number], Value>) => Value | undefined;
	useThemeEffect: (
		effect: (
			theme: ThemeSelection<Themes[number]> | undefined,
			resolvedTheme: ResolvedTheme<Themes[number]> | undefined,
		) => ReturnType<EffectCallback>,
		deps?: DependencyList,
	) => void;
	ThemedImage: (props: TypedThemedImageProps<Themes[number]>) => ReactElement;
};

export function createThemes<const Themes extends readonly [string, ...string[]]>(
	config: CreateThemesConfig<Themes>,
): CreateThemesResult<Themes> {
	const defaults = config;
	type ThemeName = Themes[number];
	const context = createThemeContext<ThemeName>();

	function TypedThemeProvider(
		props: Omit<ThemeProviderProps<ThemeName>, "themes">,
	): ReactElement {
		const merged = {
			...defaults,
			...props,
			themes: defaults.themes,
		} satisfies ThemeProviderProps<ThemeName>;
		return <ClientThemeProvider {...merged} themeContext={context} />;
	}

	function useTypedTheme(): ThemeContextValue<ThemeName> {
		return useThemeFromContext<ThemeName>(context);
	}

	function useTypedThemeValue<Value>(map: ThemeValueMap<ThemeName, Value>): Value | undefined {
		const { theme, resolvedTheme } = useTypedTheme();
		return resolveThemeValue(map, theme, resolvedTheme);
	}

	function useTypedThemeEffect(
		effect: (
			theme: ThemeSelection<ThemeName> | undefined,
			resolvedTheme: ResolvedTheme<ThemeName> | undefined,
		) => ReturnType<EffectCallback>,
		deps: DependencyList = [],
	): void {
		const { theme, resolvedTheme } = useTypedTheme();
		const isFirstRender = useRef(true);
		useEffect(() => {
			if (isFirstRender.current) {
				isFirstRender.current = false;
				return;
			}
			return effect(theme, resolvedTheme);
		}, [theme, resolvedTheme, effect, ...deps]);
	}

	function TypedThemedImage(props: TypedThemedImageProps<ThemeName>): ReactElement {
		return <ThemedImage {...props} themeContext={context} />;
	}

	return {
		ThemeProvider: TypedThemeProvider,
		useTheme: useTypedTheme,
		useThemeValue: useTypedThemeValue,
		useThemeEffect: useTypedThemeEffect,
		ThemedImage: TypedThemedImage,
	};
}
