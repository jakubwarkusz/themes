import { resolveDefaultTheme } from "./theme-validation.js";
import type { ScriptConfig } from "./script.js";
import type { ThemeProviderProps } from "./types.js";

export function getScriptConfig<Themes extends string>({
	themes = ["light", "dark"] as Themes[],
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
	themeColor,
	followSystem = false,
	initialTheme,
}: Omit<ThemeProviderProps<Themes>, "children">): ScriptConfig {
	return {
		storageKey,
		attribute,
		defaultTheme: resolveDefaultTheme(themes, enableSystem, defaultTheme),
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
	};
}
