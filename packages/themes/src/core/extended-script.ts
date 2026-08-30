import { EXTENDED_THEME_SCRIPT_SOURCE } from "./extended-script-source.js";
import type { SystemThemeMap } from "./extended-types.js";
import type { ScriptConfig } from "./script.js";

export type ExtendedScriptConfig = ScriptConfig & {
	systemThemeMap: SystemThemeMap<string> | undefined;
};

function safeJson(value: unknown): string {
	return (JSON.stringify(value) as string)
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

export function getExtendedScript(config: ExtendedScriptConfig): string {
	const args = [
		safeJson(config.storageKey),
		safeJson(config.attribute),
		safeJson(config.defaultTheme),
		safeJson(Boolean(config.enableSystem)),
		safeJson(Boolean(config.enableColorScheme)),
		safeJson(config.forcedTheme ?? null),
		safeJson(config.themes),
		safeJson(config.value ?? null),
		safeJson(config.target),
		safeJson(config.storage),
		safeJson(config.themeColors ?? null),
		safeJson(config.initialTheme ?? null),
		safeJson(config.disableTransitionOnChange),
		safeJson(Boolean(config.followSystem)),
		safeJson(config.systemThemeMap ?? null),
	].join(",");
	return `(${EXTENDED_THEME_SCRIPT_SOURCE})(${args})`;
}
