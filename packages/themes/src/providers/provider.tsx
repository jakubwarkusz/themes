import type { ReactElement } from "react";
import { getScript } from "../core/script.js";
import type { DefaultTheme, ThemeProviderProps } from "../core/types.js";
import { ClientThemeProvider } from "./client-provider.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

export function ThemeProvider<Themes extends string = DefaultTheme>({
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
}: ThemeProviderProps<Themes>): ReactElement {
	const resolvedDefault = (defaultTheme ?? (enableSystem ? "system" : "light")) as string;

	return (
		<>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: inline script required to prevent flash of unstyled theme
				dangerouslySetInnerHTML={{
					__html: getScript({
						storageKey,
						attribute,
						defaultTheme: resolvedDefault,
						enableSystem,
						enableColorScheme,
						forcedTheme: forcedTheme as string | undefined,
						themes: themes as string[],
						value: valueMap,
						target,
						storage,
						themeColors: themeColor,
						initialTheme: initialTheme as string | undefined,
					}),
				}}
				nonce={nonce}
			/>
			<ClientThemeProvider
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
			>
				{children}
			</ClientThemeProvider>
		</>
	);
}
