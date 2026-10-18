"use client";

import { useServerInsertedHTML } from "next/navigation.js";
import { type ReactElement, useEffect, useRef } from "react";
import type { ExtendedNextThemeProviderProps } from "../core/extended-types.js";
import type { DefaultTheme } from "../core/types.js";
import { ExtendedClientThemeProvider } from "./extended-client-provider.js";

export function ExtendedClientNextThemeProvider<Themes extends string = DefaultTheme>({
	bootstrap,
	...props
}: ExtendedNextThemeProviderProps<Themes> & { bootstrap: string }): ReactElement {
	const { target = "html", nonce, scriptProps } = props;
	const inserted = useRef(false);
	const scriptRef = useRef<HTMLScriptElement>(null);
	const script = (
		<script
			{...scriptProps}
			data-wrksz-theme-target={target}
			ref={scriptRef}
			suppressHydrationWarning
			// inline script required to prevent flash of unstyled theme
			dangerouslySetInnerHTML={{ __html: bootstrap }}
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
