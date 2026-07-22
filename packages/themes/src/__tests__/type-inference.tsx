import type { ReactNode } from "react";
import {
	useThemeEffect as useStandaloneThemeEffect,
	useThemeValue as useStandaloneThemeValue,
} from "../client.js";
import {
	type CookieOptions,
	type CreateThemesConfig,
	type CreateThemesResult,
	createThemes,
	type ThemeColor,
	ThemeProvider,
	type ThemeProviderProps,
	type ThemeValueMap,
	type TypedThemedImageProps,
} from "../index.js";
import { type GetThemeOptions, getTheme } from "../next.js";

function expectType<T>(_value: T): void {}

type Equal<Left, Right> =
	(<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
		? true
		: false;

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
expectType<Equal<typeof syncTheme, AppTheme>>(true);

const asyncTheme = getTheme({
	themes: ["light", "dark"] as const,
});
expectType<Promise<"light" | "dark" | "system">>(asyncTheme);

const looseTheme = getTheme(request, { defaultTheme: "dark" });
expectType<string>(looseTheme);

const invalidGetThemeOptions = {
	themes: appThemes,
	// @ts-expect-error defaultTheme must be one of the configured themes or "system"
	defaultTheme: "sepia",
} satisfies GetThemeOptions<typeof appThemes>;
expectType<readonly AppTheme[]>(invalidGetThemeOptions.themes);

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

const cookieOptions = {
	maxAge: 3600,
	sameSite: "Strict",
	secure: true,
} satisfies CookieOptions;
expectType<CookieOptions>(cookieOptions);

// @ts-expect-error exact optional properties reject explicitly undefined cookie flags
const invalidCookieOptions: CookieOptions = { secure: undefined };
expectType<CookieOptions>(invalidCookieOptions);

const themeColor = {
	light: "#fff",
	dark: "#000",
	"high-contrast": "#ff0",
} satisfies ThemeColor<AppTheme>;
expectType<ThemeColor<AppTheme>>(themeColor);

const invalidThemeColor = {
	light: "#fff",
	// @ts-expect-error themeColor keys must be configured themes
	sepia: "#704214",
} satisfies ThemeColor<AppTheme>;
expectType<ThemeColor<AppTheme>>(invalidThemeColor);

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

const validCreateThemesConfig = {
	themes: appThemes,
	storage: "hybrid",
	defaultTheme: "system",
} satisfies CreateThemesConfig<typeof appThemes>;
expectType<typeof appThemes>(validCreateThemesConfig.themes);

const invalidCreateThemesConfig = {
	themes: appThemes,
	// @ts-expect-error createThemes defaultTheme must be one of the configured themes or "system"
	defaultTheme: "sepia",
} satisfies CreateThemesConfig<typeof appThemes>;
expectType<typeof appThemes>(invalidCreateThemesConfig.themes);

const typed = createThemes({
	themes: appThemes,
	storage: "hybrid",
	defaultTheme: "system",
});
expectType<CreateThemesResult<typeof appThemes>>(typed);

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

	const values = {
		light: "Light",
		default: "Fallback",
	} satisfies ThemeValueMap<AppTheme, string>;
	expectType<string>(values.default);

	const standaloneValue = useStandaloneThemeValue({
		light: "Light",
		"high-contrast": "High contrast",
		default: "Fallback",
	});
	expectType<string | undefined>(standaloneValue);
	expectType<Equal<typeof standaloneValue, "Light" | "High contrast" | "Fallback" | undefined>>(
		true,
	);

	useStandaloneThemeEffect<AppTheme>((selectedTheme, resolvedTheme) => {
		expectType<Equal<typeof selectedTheme, AppTheme | "system" | undefined>>(true);
		expectType<Equal<typeof resolvedTheme, AppTheme | undefined>>(true);
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

const imageProps = {
	src: {
		light: "/logo-light.png",
		dark: "/logo-dark.png",
		"high-contrast": "/logo-high-contrast.png",
	},
	alt: "Logo",
} satisfies TypedThemedImageProps<AppTheme>;
expectType<string>(imageProps.src.dark);

function InvalidTypedProviderOverride(): ReactNode {
	return (
		<typed.ThemeProvider
			// @ts-expect-error typed ThemeProvider keeps the configured theme tuple fixed
			themes={["light", "dark"] as const}
		>
			children
		</typed.ThemeProvider>
	);
}
expectType<() => ReactNode>(InvalidTypedProviderOverride);

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
