"use client";
import { useServerInsertedHTML } from "next/navigation";
import { type ReactElement, useEffect, useRef } from "react";
import { getScript } from "../core/script.js";
import { resolveDefaultTheme } from "../core/theme-validation.js";
import type { DefaultTheme, ThemeProviderProps } from "../core/types.js";
import { ClientThemeProvider } from "./client-provider.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

export function ClientNextThemeProvider<Themes extends string = DefaultTheme>(
	props: ThemeProviderProps<Themes>,
): ReactElement {
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
		nonce,
		themeColor,
		followSystem = false,
		initialTheme,
		scriptProps,
		systemThemeMap,
	} = props;
	const resolvedDefault = resolveDefaultTheme(themes, enableSystem, defaultTheme);
	const inserted = useRef(false);
	const scriptRef = useRef<HTMLScriptElement>(null);
	const script = (
		<script
			{...scriptProps}
			data-wrksz-theme-target={target}
			ref={scriptRef}
			suppressHydrationWarning
			// biome-ignore lint/security/noDangerouslySetInnerHtml: inline script required to prevent flash of unstyled theme
			dangerouslySetInnerHTML={{
				__html: getScript({
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

	useServerInsertedHTML(() => {
		if (target !== "html") return null;
		if (inserted.current) return null;
		inserted.current = true;
		return script;
	});

	useEffect(() => {
		if (target === "html") return;
		const current = scriptRef.current;
		if (!current) return;
		const scripts = document.querySelectorAll<HTMLScriptElement>(
			"script[data-wrksz-theme-target]",
		);
		for (const candidate of Array.from(scripts)) {
			if (
				candidate !== current &&
				candidate.getAttribute("data-wrksz-theme-target") === target
			) {
				current.remove();
				return;
			}
		}
	}, [target]);

	if (target === "html") return <ClientThemeProvider {...props} />;
	return (
		<>
			<ClientThemeProvider {...props} />
			{script}
		</>
	);
}
