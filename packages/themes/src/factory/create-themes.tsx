"use client";

import type { DependencyList, EffectCallback, ReactElement } from "react";
import type { ThemedImageProps } from "../components/themed-image.js";
import { ThemedImage } from "../components/themed-image.js";
import { useTheme } from "../core/context.js";
import { resolveThemeValue, type ThemeValueMap } from "../core/theme-value.js";
import type {
	ResolvedTheme,
	ThemeContextValue,
	ThemeProviderProps,
	ThemeSelection,
} from "../core/types.js";
import { useThemeEffect } from "../hooks/use-theme-effect.js";
import { ClientThemeProvider } from "../providers/client-provider.js";

export type { ThemeValueMap } from "../core/theme-value.js";

export type TypedThemedImageProps<Themes extends string> = Omit<ThemedImageProps, "src"> & {
	src: Record<ResolvedTheme<Themes>, string>;
};

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

	function TypedThemeProvider(
		props: Omit<ThemeProviderProps<ThemeName>, "themes">,
	): ReactElement {
		const merged = {
			...defaults,
			...props,
			themes: defaults.themes,
		} satisfies ThemeProviderProps<ThemeName>;
		return <ClientThemeProvider {...merged} />;
	}

	function useTypedTheme(): ThemeContextValue<ThemeName> {
		return useTheme<ThemeName>();
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
		useThemeEffect((theme, resolvedTheme) => {
			return effect(
				theme as ThemeSelection<ThemeName> | undefined,
				resolvedTheme as ResolvedTheme<ThemeName> | undefined,
			);
		}, deps);
	}

	function TypedThemedImage(props: TypedThemedImageProps<ThemeName>): ReactElement {
		return <ThemedImage {...(props as ThemedImageProps)} />;
	}

	return {
		ThemeProvider: TypedThemeProvider,
		useTheme: useTypedTheme,
		useThemeValue: useTypedThemeValue,
		useThemeEffect: useTypedThemeEffect,
		ThemedImage: TypedThemedImage,
	};
}
