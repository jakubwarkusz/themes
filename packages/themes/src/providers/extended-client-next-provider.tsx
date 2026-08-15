"use client";

import { useServerInsertedHTML } from "next/navigation";
import { type ReactElement, useEffect, useRef } from "react";
import { getExtendedScript } from "../core/extended-script.js";
import type { ExtendedNextThemeProviderProps } from "../core/extended-types.js";
import { resolveDefaultTheme } from "../core/theme-validation.js";
import type { DefaultTheme } from "../core/types.js";
import { ExtendedClientThemeProvider } from "./extended-client-provider.js";

const DEFAULT_THEMES: string[] = ["light", "dark"];

export function ExtendedClientNextThemeProvider<Themes extends string = DefaultTheme>(
	props: ExtendedNextThemeProviderProps<Themes>,
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
			// inline script required to prevent flash of unstyled theme
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
			{...(nonce !== undefined ? { nonce } : null)}
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
		for (let i = 0; i < scripts.length; i++) {
			const el = scripts[i];
			if (el && el !== current && el.dataset.wrkszThemeTarget === target) {
				current.remove();
				return;
			}
		}
	}, [target]);

	if (target === "html") return <ExtendedClientThemeProvider {...props} />;
	return (
		<>
			<ExtendedClientThemeProvider {...props} />
			{script}
		</>
	);
}
