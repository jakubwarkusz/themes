import { THEME_SCRIPT_SOURCE as S } from "./script-source.js";
import type { Attribute, StorageType } from "./types.js";

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
};

/**
 * Serializes the deterministic bootstrap into an IIFE string safe for <script>.
 */
function safeJson(value: unknown): string {
	return (JSON.stringify(value) as string)
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

export function getScript(config: ScriptConfig): string {
	return (
		"(" +
		(config.storage[0] == "l" ? S.slice(0, 199) + S.slice(463) : S) +
		")(" +
		[
			config.storageKey,
			config.attribute,
			config.defaultTheme,
			config.enableSystem,
			config.enableColorScheme,
			config.forcedTheme ?? null,
			config.themes,
			config.value ?? null,
			config.target,
			config.storage,
			config.themeColors ?? null,
			config.initialTheme ?? null,
			config.disableTransitionOnChange,
			config.followSystem,
		]
			.map(safeJson)
			.join(",") +
		")"
	);
}
