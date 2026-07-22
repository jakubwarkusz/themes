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
	nonce,
	onThemeChange,
	themeColor,
	followSystem = false,
	initialTheme,
	cookieOptions,
	onStorageError,
	enableSameDocumentSync = false,
	systemThemeMap,
}: ExtendedNextThemeProviderProps<Themes>): ReactElement {
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

	return (
		<ExtendedClientThemeProvider
			themes={themes}
			forcedTheme={forcedTheme}
			enableSystem={enableSystem}
			defaultTheme={defaultTheme}
			attribute={attribute}
			value={valueMap}
			target={target}
			disableTransitionOnChange={disableTransitionOnChange}
			storage={storage}
			storageKey={storageKey}
			enableColorScheme={enableColorScheme}
			themeColor={themeColor}
			followSystem={followSystem}
			onThemeChange={onThemeChange}
			initialTheme={initialTheme}
			cookieOptions={cookieOptions}
			onStorageError={onStorageError}
			enableSameDocumentSync={enableSameDocumentSync}
			systemThemeMap={systemThemeMap}
		>
			{children}
		</ExtendedClientThemeProvider>
	);
}
