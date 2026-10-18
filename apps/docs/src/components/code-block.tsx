"use client";

import { type ReactNode, useRef } from "react";
import { CopyButton } from "./copy-button";

export function CodeBlock({ title, children }: { title?: string; children: ReactNode }) {
	const viewport = useRef<HTMLDivElement>(null);

	return (
		<figure className="not-prose relative my-6 rounded-xl bg-fd-card has-[pre:focus-visible]:ring-2 has-[pre:focus-visible]:ring-fd-ring">
			{title ? (
				<figcaption className="truncate px-4 pt-3 pr-12 font-mono text-xs text-fd-muted-foreground">
					{title}
				</figcaption>
			) : null}
			<div ref={viewport} className="overflow-x-auto outline-none">
				{children}
			</div>
			<CopyButton
				getValue={() => viewport.current?.querySelector("pre")?.textContent ?? ""}
				label="Copy code"
				className="absolute top-2 right-2"
			/>
		</figure>
	);
}
