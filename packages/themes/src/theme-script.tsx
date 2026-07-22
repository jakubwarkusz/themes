import type { ReactElement } from "react";
import { getScript } from "./core/script.js";
import type { DefaultTheme, ThemeProviderProps } from "./core/types.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

export type ThemeScriptProps<Themes extends string = DefaultTheme> = Omit<
	ThemeProviderProps<Themes>,
	"children" | "onThemeChange" | "onStorageError" | "cookieOptions" | "themeRoot"
>;

export function ThemeScript<Themes extends string = DefaultTheme>({
	themes = DEFAULT_THEMES as Themes[],
	forcedTheme,
	enableSystem = true,
	defaultTheme,
	attribute = "class",
	value,
	target = "html",
	disableTransitionOnChange = false,
	storage = "localStorage",
	storageKey = "theme",
	enableColorScheme = true,
	nonce,
	scriptProps,
	themeColor,
	followSystem = false,
	initialTheme,
	systemThemeMap,
}: ThemeScriptProps<Themes>): ReactElement {
	const resolvedDefault = defaultTheme ?? (enableSystem ? "system" : (themes[0] ?? "light"));

	return (
		<script
			{...scriptProps}
			suppressHydrationWarning
			// biome-ignore lint/security/noDangerouslySetInnerHtml: escaped inline bootstrap prevents a flash before hydration
			dangerouslySetInnerHTML={{
				__html: getScript({
					storageKey,
					attribute,
					defaultTheme: resolvedDefault,
					enableSystem,
					enableColorScheme,
					forcedTheme,
					themes,
					value,
					target,
					storage,
					themeColors: themeColor,
					initialTheme,
					disableTransitionOnChange,
					followSystem,
					systemThemeMap,
				}),
			}}
			nonce={nonce}
		/>
	);
}
