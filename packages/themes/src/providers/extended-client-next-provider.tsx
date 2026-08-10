"use client";

import { useServerInsertedHTML } from "next/navigation";
import { type ReactElement, useRef } from "react";
import { getExtendedScript } from "../core/extended-script.js";
import type { ExtendedNextThemeProviderProps } from "../core/extended-types.js";
import type { DefaultTheme } from "../core/types.js";
import { ExtendedClientThemeProvider } from "./extended-client-provider.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

export function ExtendedClientNextThemeProvider<Themes extends string = DefaultTheme>({
	children,
	nonce,
	...providerProps
}: ExtendedNextThemeProviderProps<Themes>): ReactElement {
	const {
		themes = DEFAULT_THEMES as Themes[],
		forcedTheme,
		enableSystem = true,
		defaultTheme,
		attribute = "class",
		value: valueMap,
		target = "html",
		disableTransitionOnChange = false,
		storage = "localStorage",
		storageKey = "theme",
		enableColorScheme = true,
		themeColor,
		followSystem = false,
		initialTheme,
		systemThemeMap,
	} = providerProps;
	const resolvedDefault = (defaultTheme ?? (enableSystem ? "system" : "light")) as string;
	const inserted = useRef(false);

	useServerInsertedHTML(() => {
		if (inserted.current) return null;
		inserted.current = true;
		return (
			<script
				suppressHydrationWarning
				// biome-ignore lint/security/noDangerouslySetInnerHtml: inline script required to prevent flash of unstyled theme
				dangerouslySetInnerHTML={{
					__html: getExtendedScript({
						storageKey,
						attribute,
						defaultTheme: resolvedDefault,
						enableSystem,
						enableColorScheme,
						forcedTheme: forcedTheme as string | undefined,
						themes,
						value: valueMap,
						target,
						storage,
						themeColors: themeColor,
						initialTheme: initialTheme as string | undefined,
						disableTransitionOnChange,
						followSystem,
						systemThemeMap,
					}),
				}}
				nonce={nonce}
			/>
		);
	});

	return <ExtendedClientThemeProvider {...providerProps}>{children}</ExtendedClientThemeProvider>;
}
