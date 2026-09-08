"use client";

import type { ReactElement } from "react";
import type { ThemeContextInstance } from "../core/context.js";
import type { ThemeProviderProps } from "../core/types.js";
import { ClientNextThemeProvider } from "../providers/client-next-provider.js";
import { ThemeScript, type ThemeScriptProps } from "../theme-script.js";
import {
	type CreateThemesConfig,
	type CreateThemesResult,
	createThemesBindings,
} from "./create-themes.js";

export type {
	CreateThemesConfig,
	CreateThemesResult,
	ThemeValueMap,
	TypedThemedImageProps,
} from "./create-themes.js";
export type { ThemeScriptProps } from "../theme-script.js";

export type CreateNextThemesResult<Themes extends readonly string[]> =
	CreateThemesResult<Themes> & {
		NextThemeProvider: (
			props: Omit<ThemeProviderProps<Themes[number]>, "themes">,
		) => ReactElement;
		ThemeScript: (props?: Omit<ThemeScriptProps<Themes[number]>, "themes">) => ReactElement;
	};

type NextProviderProps<Themes extends string> = Omit<ThemeProviderProps<Themes>, "themes"> & {
	themes: readonly Themes[];
	themeContext: ThemeContextInstance<Themes>;
};

function toThemeScriptProps<Themes extends readonly string[]>(
	config: CreateThemesConfig<Themes>,
): Omit<ThemeScriptProps<Themes[number]>, "themes"> {
	const {
		onThemeChange: _onThemeChange,
		onStorageError: _onStorageError,
		cookieOptions: _cookieOptions,
		themes: _themes,
		...scriptDefaults
	} = config;
	return scriptDefaults;
}

export function createThemes<const Themes extends readonly [string, ...string[]]>(
	config: CreateThemesConfig<Themes>,
): CreateNextThemesResult<Themes> {
	const bindings = createThemesBindings(config);
	const scriptDefaults = toThemeScriptProps(config);
	type ThemeName = Themes[number];

	function TypedNextThemeProvider(
		props: Omit<ThemeProviderProps<ThemeName>, "themes">,
	): ReactElement {
		const merged = {
			...config,
			...props,
			themes: config.themes,
			themeContext: bindings.themeContext,
		} satisfies NextProviderProps<ThemeName>;
		return <ClientNextThemeProvider {...merged} />;
	}

	function TypedThemeScript(
		props: Omit<ThemeScriptProps<ThemeName>, "themes"> = {},
	): ReactElement {
		return <ThemeScript {...scriptDefaults} {...props} themes={config.themes} />;
	}

	return {
		ThemeProvider: bindings.ThemeProvider,
		NextThemeProvider: TypedNextThemeProvider,
		ThemeScript: TypedThemeScript,
		useTheme: bindings.useTheme,
		useThemeValue: bindings.useThemeValue,
		useThemeEffect: bindings.useThemeEffect,
		ThemedImage: bindings.ThemedImage,
	};
}

export const createNextThemes: typeof createThemes = createThemes;
