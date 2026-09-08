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
	return (
		"(" +
		EXTENDED_THEME_SCRIPT_SOURCE +
		")(" +
		[
			config.storageKey,
			config.attribute,
			config.defaultTheme,
			!!config.enableSystem,
			!!config.enableColorScheme,
			config.forcedTheme ?? null,
			config.themes,
			config.value ?? null,
			config.target,
			config.storage,
			config.themeColors ?? null,
			config.initialTheme ?? null,
			config.disableTransitionOnChange,
			!!config.followSystem,
			config.systemThemeMap ?? null,
		]
			.map(safeJson)
			.join(",") +
		")"
	);
}
