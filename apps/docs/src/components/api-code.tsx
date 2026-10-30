"use client";

import Link from "next/link";
import { type ComponentProps, createContext, type ReactNode, use } from "react";
import { HoverPreview } from "./hover-preview";

type ApiPage = { url: string; title: string; description?: string };

const InsideLink = createContext(false);
const ApiPages = createContext<Record<string, ApiPage>>({});

export function ApiPagesProvider({
	pages,
	children,
}: {
	pages: Record<string, ApiPage>;
	children: ReactNode;
}) {
	return <ApiPages value={pages}>{children}</ApiPages>;
}

export function AutoCode(props: ComponentProps<"code">) {
	const pages = use(ApiPages);
	const api = typeof props.children === "string" ? pages[props.children] : undefined;
	if (!api) return <code {...props} />;
	return <ApiCode {...props} href={api.url} title={api.title} description={api.description} />;
}

export function LinkScope({ children }: { children: ReactNode }) {
	return <InsideLink value>{children}</InsideLink>;
}

export function ApiCode({
	href,
	title,
	description,
	...props
}: ComponentProps<"code"> & { href: string; title: string; description?: string }) {
	if (use(InsideLink)) return <code {...props} />;

	return (
		<HoverPreview
			href={href}
			content={
				<>
					<div className="flex flex-col gap-1">
						<span className="font-mono text-[13px] font-medium text-fd-foreground">
							{title}
						</span>
						{description ? (
							<p className="text-xs leading-relaxed text-fd-muted-foreground">
								{description}
							</p>
						) : null}
					</div>
					<Link
						href={href}
						className="border-t border-fd-border/60 pt-3 text-xs font-medium text-fd-foreground outline-none hover:underline focus-visible:underline"
					>
						Open API reference
					</Link>
				</>
			}
		>
			<code {...props} />
		</HoverPreview>
	);
}
