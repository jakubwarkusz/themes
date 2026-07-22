import type { ThemeProviderProps } from "@wrksz/themes";

export const appThemes = ["light", "dark"] as const;
export type AppTheme = (typeof appThemes)[number];

export const themeProviderDefaults = {
	attribute: "class",
	defaultTheme: "system",
	enableSystem: true,
	storage: "localStorage",
	disableTransitionOnChange: true,
} satisfies Omit<ThemeProviderProps<AppTheme>, "children" | "themes">;
