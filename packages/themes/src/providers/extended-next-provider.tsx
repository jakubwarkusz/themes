import type { ReactElement } from "react";
import { getExtendedScript } from "../core/extended-script.js";
import { getScriptConfig } from "../core/script-config.js";
import type { ExtendedNextThemeProviderProps } from "../core/extended-types.js";
import type { DefaultTheme } from "../core/types.js";
import { ExtendedClientNextThemeProvider } from "./extended-client-next-provider.js";

export function ExtendedThemeProvider<Themes extends string = DefaultTheme>(
	props: ExtendedNextThemeProviderProps<Themes>,
): ReactElement {
	return (
		<ExtendedClientNextThemeProvider
			{...props}
			bootstrap={getExtendedScript({
				...getScriptConfig(props),
				systemThemeMap: props.systemThemeMap,
			})}
		/>
	);
}
