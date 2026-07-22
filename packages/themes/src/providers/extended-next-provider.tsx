import { cookies } from "next/headers";
import type { ReactElement } from "react";
import type { ExtendedNextThemeProviderProps } from "../core/extended-types.js";
import { isThemeSelection } from "../core/theme-validation.js";
import type { DefaultTheme } from "../core/types.js";
import { ExtendedClientNextThemeProvider } from "./extended-client-next-provider.js";

export async function ExtendedThemeProvider<Themes extends string = DefaultTheme>(
	props: ExtendedNextThemeProviderProps<Themes>,
): Promise<ReactElement> {
	let serverTheme: string | undefined;

	if (props.storage === "cookie" || props.storage === "hybrid") {
		try {
			const cookieStore = await cookies();
			const stored = cookieStore.get(props.storageKey ?? "theme")?.value;
			if (stored && isThemeSelection(stored, props.themes, props.enableSystem ?? true))
				serverTheme = stored;
		} catch {
			// Static generation or out-of-request context
		}
	}

	return (
		<ExtendedClientNextThemeProvider
			{...props}
			initialTheme={(props.initialTheme ?? serverTheme) as Themes | undefined}
		/>
	);
}
