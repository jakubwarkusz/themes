"use client";

import type { DependencyList, EffectCallback, ReactElement } from "react";
import type { ThemedImageProps } from "../components/themed-image.js";
import { ThemedImage } from "../components/themed-image.js";
import { useTheme } from "../core/context.js";
import type { ThemeContextValue, ThemeProviderProps } from "../core/types.js";
import { useThemeEffect } from "../hooks/use-theme-effect.js";
import { ThemeProvider } from "../providers/provider.js";

type ThemeValueMap<Themes extends string, Value> = Partial<Record<Themes | "system", Value>> & {
	default?: Value;
};

type TypedThemedImageProps<Themes extends string> = Omit<ThemedImageProps, "src"> & {
	src: Record<Themes, string>;
};

type CreateThemesConfig<Themes extends readonly string[]> = Omit<
	ThemeProviderProps<Themes[number]>,
	"children" | "themes"
> & {
	themes: Themes;
};

type FactoryResult<Themes extends readonly string[]> = {
	ThemeProvider: (props: ThemeProviderProps<Themes[number]>) => ReactElement;
	useTheme: () => ThemeContextValue<Themes[number]>;
	useThemeValue: <Value>(map: ThemeValueMap<Themes[number], Value>) => Value | undefined;
	useThemeEffect: (
		effect: (
			theme: Themes[number] | "system" | undefined,
			resolvedTheme: Exclude<Themes[number], "system"> | undefined,
		) => ReturnType<EffectCallback>,
		deps?: DependencyList,
	) => void;
	ThemedImage: (props: TypedThemedImageProps<Themes[number]>) => ReactElement;
};

export function createThemes<const Themes extends readonly [string, ...string[]]>(
	config: CreateThemesConfig<Themes>,
): FactoryResult<Themes> {
	const defaults = config;
	type ThemeName = Themes[number];

	function TypedThemeProvider(props: ThemeProviderProps<ThemeName>): ReactElement {
		const merged = {
			...defaults,
			...props,
			themes: (props.themes ?? defaults.themes) as ThemeName[],
		} satisfies ThemeProviderProps<ThemeName>;
		return <ThemeProvider {...merged} />;
	}

	function useTypedTheme(): ThemeContextValue<ThemeName> {
		return useTheme<ThemeName>();
	}

	function useTypedThemeValue<Value>(map: ThemeValueMap<ThemeName, Value>): Value | undefined {
		const { theme, resolvedTheme } = useTypedTheme();
		if (resolvedTheme && map[resolvedTheme] !== undefined) return map[resolvedTheme];
		if (theme && map[theme] !== undefined) return map[theme];
		return map.default;
	}

	function useTypedThemeEffect(
		effect: (
			theme: ThemeName | "system" | undefined,
			resolvedTheme: Exclude<ThemeName, "system"> | undefined,
		) => ReturnType<EffectCallback>,
		deps: DependencyList = [],
	): void {
		useThemeEffect((theme, resolvedTheme) => {
			return effect(
				theme as ThemeName | "system" | undefined,
				resolvedTheme as Exclude<ThemeName, "system"> | undefined,
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
