"use client";

import { createThemes } from "@wrksz/themes/client";
import { appThemes, themeProviderDefaults } from "@/lib/theme-config";

export const { ThemeProvider, ThemedImage, useTheme, useThemeEffect, useThemeValue } = createThemes(
	{
		...themeProviderDefaults,
		themes: appThemes,
	},
);
