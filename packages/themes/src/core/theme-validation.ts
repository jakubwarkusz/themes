export function isThemeSelection(
	candidate: string,
	themes: readonly string[] | undefined,
	enableSystem = true,
): boolean {
	return candidate === "system" ? enableSystem : !themes || themes.includes(candidate);
}
