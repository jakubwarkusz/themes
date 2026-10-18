import type { ReactElement } from "react";
import { getScriptConfig } from "../core/script-config.js";
import { getScript } from "../core/script.js";
import type { DefaultTheme, ThemeProviderProps } from "../core/types.js";
import { ClientNextThemeProvider } from "./client-next-provider.js";

export function ThemeProvider<Themes extends string = DefaultTheme>(
	props: ThemeProviderProps<Themes>,
): ReactElement {
	return <ClientNextThemeProvider {...props} bootstrap={getScript(getScriptConfig(props))} />;
}
