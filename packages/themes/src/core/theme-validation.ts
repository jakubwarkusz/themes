export function isThemeSelection(
	candidate: string,
	themes: readonly string[] | undefined,
	enableSystem = true,
): boolean {
	return candidate === "system" ? enableSystem : !themes || themes.includes(candidate);
}

export function resolveDefaultTheme<Themes extends string>(
	themes: readonly Themes[],
	enableSystem: boolean,
	defaultTheme: Themes | "system" | undefined,
): Themes | "system" {
	const fallback = (themes[0] ?? "light") as Themes;
	if (defaultTheme !== undefined) {
		if (defaultTheme === "system") {
			return enableSystem ? "system" : fallback;
		}
		return themes.includes(defaultTheme) ? defaultTheme : fallback;
	}

	return enableSystem ? "system" : fallback;
}
