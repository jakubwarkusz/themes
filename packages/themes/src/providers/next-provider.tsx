import type { ReactElement } from "react";
import type { DefaultTheme, ThemeProviderProps } from "../core/types.js";
import { ClientNextThemeProvider } from "./client-next-provider.js";

export async function ThemeProvider<Themes extends string = DefaultTheme>(
	props: ThemeProviderProps<Themes>,
): Promise<ReactElement> {
	let serverTheme: string | undefined;

	if (props.storage === "cookie" || props.storage === "hybrid") {
		try {
			const { cookies } = await import("next/headers");
			const cookieStore = await cookies();
			const stored = cookieStore.get(props.storageKey ?? "theme")?.value;
			if (stored) serverTheme = stored;
		} catch {
			// Static generation or out-of-request context
		}
	}

	return (
		<ClientNextThemeProvider
			{...props}
			initialTheme={(props.initialTheme ?? serverTheme) as Themes | undefined}
		/>
	);
}
