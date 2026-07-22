import {
	ClientThemeProvider,
	createThemes,
	ThemedImage,
	ThemeContext,
	useHydrated,
	useTheme,
	useThemeEffect,
	useThemeValue,
} from "@wrksz/themes/client";
import { createThemes as createThemesSubpath } from "@wrksz/themes/client/create-themes";
import { useHydrated as useHydratedSubpath } from "@wrksz/themes/client/use-hydrated";
import { ClientThemeProvider as ClientThemeProviderSubpath } from "@wrksz/themes/client/provider";
import { ThemedImage as ThemedImageSubpath } from "@wrksz/themes/client/themed-image";
import {
	ThemeContext as ThemeContextSubpath,
	useTheme as useThemeSubpath,
} from "@wrksz/themes/client/use-theme";
import { useThemeEffect as useThemeEffectSubpath } from "@wrksz/themes/client/use-theme-effect";
import { useThemeValue as useThemeValueSubpath } from "@wrksz/themes/client/use-theme-value";
import {
	createThemes as createRootThemes,
	ThemeProvider as RootThemeProvider,
} from "@wrksz/themes";
import type { ReactNode } from "react";
import type {
	CookieOptions,
	ThemeColor,
	ThemeContextValue,
	ThemeProviderProps,
} from "@wrksz/themes";
import { getTheme, ThemeProvider as NextThemeProvider } from "@wrksz/themes/next";
import { ThemeScript } from "@wrksz/themes/script";

const themes = ["light", "dark", "high-contrast"] as const;
type AppTheme = (typeof themes)[number];

const configured = createThemes({
	themes,
	defaultTheme: "system",
	themeColor: {
		light: "#fff",
		dark: "#000",
		"high-contrast": "#ff0",
	},
});

const providerProps = {
	children: null,
	themes,
	defaultTheme: "light",
	cookieOptions: {
		sameSite: "Lax",
		secure: true,
	} satisfies CookieOptions,
	themeColor: {
		light: "#fff",
		dark: "#000",
	} satisfies ThemeColor<AppTheme>,
} satisfies ThemeProviderProps<AppTheme>;

function TypeConsumer(): ReactNode {
	const context = configured.useTheme();
	const standaloneContext = useTheme<AppTheme>();
	const image = (
		<configured.ThemedImage
			alt="Theme preview"
			src={{
				light: "/light.png",
				dark: "/dark.png",
				"high-contrast": "/contrast.png",
			}}
		/>
	);

	const typedContext: ThemeContextValue<AppTheme> = context;
	const typedStandaloneContext: ThemeContextValue<AppTheme> = standaloneContext;
	return (
		<>
			{image}
			{typedContext.theme}
			{typedStandaloneContext.resolvedTheme}
		</>
	);
}

const syncTheme = getTheme(new Request("https://example.com"), {
	themes,
	defaultTheme: "light",
});
const checkedTheme: AppTheme = syncTheme;

export {
	checkedTheme,
	ClientThemeProvider,
	ClientThemeProviderSubpath,
	configured,
	createRootThemes,
	createThemesSubpath,
	NextThemeProvider,
	providerProps,
	RootThemeProvider,
	ThemedImage,
	ThemedImageSubpath,
	ThemeContext,
	ThemeContextSubpath,
	ThemeScript,
	TypeConsumer,
	useHydrated,
	useHydratedSubpath,
	useThemeEffect,
	useThemeEffectSubpath,
	useThemeSubpath,
	useThemeValue,
	useThemeValueSubpath,
};
