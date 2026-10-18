import type { ReactElement } from "react";
import { getScript } from "./core/script.js";
import { getScriptConfig } from "./core/script-config.js";
import type { DefaultTheme, ThemeProviderProps } from "./core/types.js";

export type ThemeScriptProps<Themes extends string = DefaultTheme> = Omit<
	ThemeProviderProps<Themes>,
	"children" | "onThemeChange" | "onStorageError" | "cookieOptions"
>;

export function ThemeScript<Themes extends string = DefaultTheme>(
	props: ThemeScriptProps<Themes>,
): ReactElement {
	const { nonce, scriptProps } = props;

	return (
		<script
			{...scriptProps}
			suppressHydrationWarning
			// escaped inline bootstrap prevents a flash before hydration
			dangerouslySetInnerHTML={{ __html: getScript(getScriptConfig(props)) }}
			{...(nonce !== undefined ? { nonce } : null)}
		/>
	);
}
