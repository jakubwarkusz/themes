"use client";

import { createThemes } from "@wrksz/themes/client";
import { appThemes, themeProviderDefaults } from "@/lib/theme-config";

export const { ThemeProvider, useTheme } = createThemes({
	...themeProviderDefaults,
	themes: appThemes,
});
