"use client";

import type { ReactElement } from "react";
import { getScriptConfig } from "../core/script-config.js";
import { getScript } from "../core/script.js";
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

export function createThemes<const Themes extends readonly [string, ...string[]]>(
	config: CreateThemesConfig<Themes>,
): CreateNextThemesResult<Themes> {
	const { themeContext, ThemeProvider, ...hooks } = createThemesBindings(config);
	const scriptDefaults = { ...config };
	type ThemeName = Themes[number];

	function TypedNextThemeProvider(
		props: Omit<ThemeProviderProps<ThemeName>, "themes">,
	): ReactElement {
		const merged = {
			...config,
			...props,
			themes: config.themes,
		};
		return (
			<ClientNextThemeProvider
				{...merged}
				themeContext={themeContext}
				bootstrap={getScript(getScriptConfig(merged))}
			/>
		);
	}

	function TypedThemeScript(
		props: Omit<ThemeScriptProps<ThemeName>, "themes"> = {},
	): ReactElement {
		return <ThemeScript {...scriptDefaults} {...props} themes={config.themes} />;
	}

	return {
		ThemeProvider,
		NextThemeProvider: TypedNextThemeProvider,
		ThemeScript: TypedThemeScript,
		...hooks,
	};
}

export const createNextThemes: typeof createThemes = createThemes;
