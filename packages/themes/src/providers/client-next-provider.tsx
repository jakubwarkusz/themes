"use client";
import { useServerInsertedHTML } from "next/navigation.js";
import { type ReactElement, useEffect, useRef } from "react";
import type { DefaultTheme } from "../core/types.js";
import { type ClientThemeProviderProps, ClientThemeProvider } from "./client-provider.js";

export function ClientNextThemeProvider<Themes extends string = DefaultTheme>({
	bootstrap,
	...props
}: ClientThemeProviderProps<Themes> & { bootstrap: string }): ReactElement {
	const { target = "html", nonce, scriptProps } = props;
	const inserted = useRef(false);
	const scriptRef = useRef<HTMLScriptElement>(null);
	const script = (
		<script
			{...scriptProps}
			data-wrksz-theme-target={target}
			ref={scriptRef}
			suppressHydrationWarning
			dangerouslySetInnerHTML={{ __html: bootstrap }}
			{...(nonce != null && { nonce })}
		/>
	);

	useServerInsertedHTML(() => {
		if (target != "html" || inserted.current) return null;
		inserted.current = true;
		return script;
	});

	useEffect(() => {
		if (target == "html") return;
		const current = scriptRef.current;
		if (!current) return;
		for (const el of document.querySelectorAll(
			"script[data-wrksz-theme-target]",
		) as unknown as Iterable<HTMLScriptElement>) {
			if (el != current && el.dataset.wrkszThemeTarget == target) {
				current.remove();
				return;
			}
		}
	}, [target]);

	if (target == "html") return <ClientThemeProvider {...props} />;
	return (
		<>
			<ClientThemeProvider {...props} />
			{script}
		</>
	);
}
