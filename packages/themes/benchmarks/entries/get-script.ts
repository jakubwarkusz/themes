import { getScript } from "../../src/core/script.js";

export const representativeScript: string = getScript({
	storageKey: "theme",
	attribute: ["class", "data-theme"],
	defaultTheme: "system",
	enableSystem: true,
	enableColorScheme: true,
	forcedTheme: undefined,
	themes: ["light", "dark"],
	value: { dark: "dark dark-palette" },
	target: "html",
	storage: "hybrid",
	themeColors: { light: "#fff", dark: "#000" },
	initialTheme: undefined,
	disableTransitionOnChange: true,
	followSystem: false,
	systemThemeMap: undefined,
});
