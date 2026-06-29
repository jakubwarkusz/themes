import type { ReactNode } from "react";
import { createThemes, ThemeProvider, type ThemeProviderProps } from "../index.js";
import { getTheme } from "../next.js";

function expectType<T>(_value: T): void {}

const request = new Request("https://example.com", {
	headers: { cookie: "theme=dark" },
});

const appThemes = ["light", "dark", "high-contrast"] as const;
type AppTheme = (typeof appThemes)[number];

const syncTheme = getTheme(request, {
	themes: appThemes,
	defaultTheme: "light",
});
expectType<AppTheme>(syncTheme);

const asyncTheme = getTheme({
	themes: ["light", "dark"] as const,
});
expectType<Promise<"light" | "dark" | "system">>(asyncTheme);

const looseTheme = getTheme(request, { defaultTheme: "dark" });
expectType<string>(looseTheme);

// @ts-expect-error defaultTheme must be one of the configured themes or "system"
getTheme(request, {
	themes: appThemes,
	defaultTheme: "sepia",
});

const validProviderProps = {
	children: null,
	themes: appThemes,
	defaultTheme: "high-contrast",
	forcedTheme: "dark",
	initialTheme: "system",
	value: {
		light: "theme-light",
		dark: "theme-dark",
		"high-contrast": "theme-high-contrast",
	},
} satisfies ThemeProviderProps<AppTheme>;
expectType<readonly AppTheme[] | undefined>(validProviderProps.themes);

const invalidProviderProps = {
	children: null,
	themes: appThemes,
	// @ts-expect-error forcedTheme must be one of the configured themes
	forcedTheme: "sepia",
} satisfies ThemeProviderProps<AppTheme>;
expectType<ReactNode>(invalidProviderProps.children);

function ProviderUsage(): ReactNode {
	return (
		<ThemeProvider themes={appThemes} defaultTheme="high-contrast">
			children
		</ThemeProvider>
	);
}
expectType<() => ReactNode>(ProviderUsage);

const typed = createThemes({
	themes: appThemes,
	storage: "hybrid",
	defaultTheme: "system",
});

function TypedUsage(): ReactNode {
	const { theme, resolvedTheme, setTheme } = typed.useTheme();
	expectType<AppTheme | "system" | undefined>(theme);
	expectType<AppTheme | undefined>(resolvedTheme);
	setTheme("high-contrast");
	// @ts-expect-error setTheme only accepts configured themes or "system"
	setTheme("sepia");

	const label = typed.useThemeValue({
		light: "Dark",
		dark: "Light",
		"high-contrast": "Default contrast",
	});
	expectType<string | undefined>(label);

	typed.useThemeValue({
		light: "Dark",
		// @ts-expect-error useThemeValue only accepts configured themes plus "system" and "default"
		sepia: "Nope",
	});

	return (
		<typed.ThemedImage
			src={{
				light: "/logo-light.png",
				dark: "/logo-dark.png",
				"high-contrast": "/logo-high-contrast.png",
			}}
			alt="Logo"
		/>
	);
}
expectType<() => ReactNode>(TypedUsage);

function InvalidTypedImage(): ReactNode {
	return (
		<typed.ThemedImage
			// @ts-expect-error ThemedImage requires a source for every configured theme
			src={{
				light: "/logo-light.png",
				dark: "/logo-dark.png",
			}}
			alt="Logo"
		/>
	);
}
expectType<() => ReactNode>(InvalidTypedImage);
