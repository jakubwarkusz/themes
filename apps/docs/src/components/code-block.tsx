"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createContext, type ReactNode, use, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { CopyButton } from "./copy-button";

const COLLAPSE_AFTER = 16;

export const CodeCollapse = createContext(true);

export function CodeBlock({
	title,
	lines = 0,
	copyValue,
	children,
}: {
	title?: string;
	lines?: number;
	copyValue?: string;
	children: ReactNode;
}) {
	const viewport = useRef<HTMLDivElement>(null);
	const id = useId();
	const [expanded, setExpanded] = useState(false);
	const collapsible = use(CodeCollapse) && lines > COLLAPSE_AFTER;
	const collapsed = collapsible && !expanded;

	return (
		<figure
			data-code-block
			className="not-prose relative my-6 rounded-xl bg-fd-card has-[pre:focus-visible]:ring-2 has-[pre:focus-visible]:ring-fd-ring"
		>
			{title ? (
				<figcaption className="truncate px-4 pt-3 pr-12 font-mono text-xs text-fd-muted-foreground">
					{title}
				</figcaption>
			) : null}
			<div
				id={id}
				ref={viewport}
				className={cn(
					"overflow-x-auto outline-none",
					collapsed && "max-h-[calc(16*1.625*0.875rem+0.875rem)] overflow-y-hidden",
				)}
			>
				{children}
			</div>

			{collapsed && (
				<div className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-center rounded-b-xl bg-linear-to-b from-transparent to-fd-card pb-3">
					<button
						type="button"
						aria-expanded={false}
						aria-controls={id}
						onClick={(event) => {
							setExpanded(true);
							if (event.detail === 0) viewport.current?.querySelector("pre")?.focus();
						}}
						className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fd-foreground/80 outline-none transition-[color,scale] duration-150 ease-out hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]"
					>
						Show all {lines} lines
						<HugeiconsIcon
							icon={ArrowDown01Icon}
							size={12}
							color="currentColor"
							strokeWidth={2}
						/>
					</button>
				</div>
			)}

			<CopyButton
				getValue={() =>
					copyValue ?? viewport.current?.querySelector("pre")?.textContent ?? ""
				}
				label="Copy code"
				className="absolute top-2 right-2"
			/>
		</figure>
	);
}
