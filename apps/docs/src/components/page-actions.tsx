"use client";

import { ArrowDown01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Popover, PopoverContent, PopoverTrigger } from "fumadocs-ui/components/ui/popover";
import { ChatGPTLogo, ClaudeLogo, CursorLogo, GrokLogo, MarkdownLogo } from "./ai-logos";
import { CopyIcons, useCopied } from "./copy-button";

const ACTION =
	"inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-fd-muted-foreground outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-fd-accent hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96] data-[state=open]:bg-fd-accent data-[state=open]:text-fd-foreground";

async function copyMarkdown(markdownUrl: string) {
	const text = fetch(markdownUrl).then((res) => {
		if (!res.ok) throw new Error(`${res.status}`);
		return res.text();
	});
	if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
		await navigator.clipboard.write([
			new ClipboardItem({
				"text/plain": text.then((t) => new Blob([t], { type: "text/plain" })),
			}),
		]);
		return;
	}
	await navigator.clipboard.writeText(await text);
}

export function PageActions({ markdownUrl, pageUrl }: { markdownUrl: string; pageUrl: string }) {
	const [copied, copy] = useCopied(() => copyMarkdown(markdownUrl));
	const prompt = `Read ${pageUrl}, I want to ask questions about it.`;
	const links = [
		{ label: "View as Markdown", href: markdownUrl, logo: MarkdownLogo },
		{
			label: "Open in ChatGPT",
			href: `https://chatgpt.com/?${new URLSearchParams({ prompt, hints: "search" })}`,
			logo: ChatGPTLogo,
		},
		{
			label: "Open in Claude",
			href: `https://claude.ai/new?${new URLSearchParams({ q: prompt })}`,
			logo: ClaudeLogo,
		},
		{
			label: "Open in Grok",
			href: `https://grok.com/?${new URLSearchParams({ q: prompt })}`,
			logo: GrokLogo,
		},
		{
			label: "Open in Cursor",
			href: `https://cursor.com/link/prompt?${new URLSearchParams({ text: prompt })}`,
			logo: CursorLogo,
		},
	];

	return (
		<div className="flex items-center gap-1">
			<button type="button" onClick={copy} aria-live="polite" className={ACTION}>
				<CopyIcons copied={copied} />
				{copied ? "Copied" : "Copy Markdown"}
			</button>
			<Popover>
				<PopoverTrigger className={ACTION}>
					Open
					<HugeiconsIcon
						icon={ArrowDown01Icon}
						size={12}
						color="currentColor"
						strokeWidth={2}
					/>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="flex min-w-48 flex-col rounded-xl border-0 bg-fd-popover p-1 shadow-[0_10px_24px_rgb(0_0_0/0.09),0_2px_8px_rgb(0_0_0/0.06),0_0_0_1px_var(--color-fd-border)] backdrop-blur-none"
				>
					{links.map((link) => (
						<a
							key={link.label}
							href={link.href}
							target="_blank"
							rel="noreferrer noopener"
							className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-fd-foreground outline-none transition-colors hover:bg-fd-accent focus-visible:bg-fd-accent"
						>
							<link.logo className="size-4 shrink-0" />
							{link.label}
							<HugeiconsIcon
								icon={ArrowUpRight01Icon}
								size={12}
								color="currentColor"
								strokeWidth={2}
								className="ms-auto text-fd-muted-foreground"
							/>
						</a>
					))}
				</PopoverContent>
			</Popover>
		</div>
	);
}
