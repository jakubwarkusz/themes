"use client";

import { Link04Icon } from "@hugeicons/core-free-icons";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { CopyIcons, useCopied } from "./copy-button";

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

export function Heading({
	as: As,
	id,
	className,
	children,
	...props
}: ComponentProps<"h2"> & { as: HeadingTag }) {
	const [copied, copy] = useCopied(() => {
		const url = new URL(window.location.href);
		url.hash = id ?? "";
		return navigator.clipboard.writeText(url.href);
	});

	if (!id) {
		return (
			<As className={className} {...props}>
				{children}
			</As>
		);
	}

	return (
		<As
			id={id}
			className={cn("group/heading flex scroll-m-28 items-center gap-1.5", className)}
			{...props}
		>
			<a data-card="" href={`#${id}`}>
				{children}
			</a>
			<button
				type="button"
				onClick={copy}
				aria-label={copied ? "Link copied" : "Copy link to section"}
				className="not-prose flex size-6 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground opacity-0 outline-none transition-[opacity,color,scale] duration-150 ease-out group-hover/heading:opacity-100 hover:text-fd-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96] data-[copied=true]:opacity-100"
				data-copied={copied}
			>
				<CopyIcons copied={copied} icon={Link04Icon} />
			</button>
		</As>
	);
}
