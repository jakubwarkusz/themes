import { EXTENDED_THEME_SCRIPT_SOURCE } from "./extended-script-source.js";
import type { SystemThemeMap } from "./extended-types.js";
import { renderBootstrap, type ScriptConfig } from "./script.js";

export type ExtendedScriptConfig = ScriptConfig & {
	systemThemeMap: SystemThemeMap<string> | undefined;
};

export function getExtendedScript(config: ExtendedScriptConfig): string {
	return renderBootstrap(EXTENDED_THEME_SCRIPT_SOURCE, [
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
	]);
}
