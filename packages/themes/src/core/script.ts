import { THEME_SCRIPT_SOURCE } from "./script-source.js";
import type { Attribute, StorageType, SystemThemeMap } from "./types.js";

export type ScriptConfig = {
	storageKey: string;
	attribute: Attribute | readonly Attribute[];
	defaultTheme: string;
	enableSystem: boolean;
	enableColorScheme: boolean;
	forcedTheme: string | undefined;
	themes: readonly string[];
	value: Partial<Record<string, string>> | undefined;
	target: string;
	storage: StorageType;
	themeColors: string | Partial<Record<string, string>> | undefined;
	initialTheme: string | undefined;
	disableTransitionOnChange: boolean | string;
	followSystem: boolean;
	systemThemeMap: SystemThemeMap<string> | undefined;
};

/**
 * Serializes themeScript into an IIFE string safe for injection into <script>.
 */
function safeJson(value: unknown): string {
	return (JSON.stringify(value) as string)
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

export function getScript(config: ScriptConfig): string {
	const args = [
		safeJson(config.storageKey),
		safeJson(config.attribute),
		safeJson(config.defaultTheme),
		String(config.enableSystem),
		String(config.enableColorScheme),
		safeJson(config.forcedTheme ?? null),
		safeJson(config.themes),
		safeJson(config.value ?? null),
		safeJson(config.target),
		safeJson(config.storage),
		safeJson(config.themeColors ?? null),
		safeJson(config.initialTheme ?? null),
		safeJson(config.disableTransitionOnChange),
		String(config.followSystem),
		safeJson(config.systemThemeMap ?? null),
	].join(",");

	return `(${THEME_SCRIPT_SOURCE})(${args})`;
}
