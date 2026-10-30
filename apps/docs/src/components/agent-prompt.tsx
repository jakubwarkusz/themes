"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ClaudeCodeLogo, CodexLogo, CursorLogo } from "./ai-logos";
import { CopyIcons, useCopied } from "./copy-button";

const MIGRATE_PROMPT = `Migrate this project from next-themes to @wrksz/themes.

Follow https://themes.wrksz.dev/llms.mdx/docs/migration and https://themes.wrksz.dev/llms.mdx/docs/agents.
Keep the existing storageKey, theme names and CSS selectors so saved preferences survive. next-themes defaults to attribute="data-theme", so set it explicitly if the project relied on that.
Remove next-themes only after no imports are left, then type-check and build the app and report what you changed.`;

export const SETUP_PROMPT = `Add light, dark and system theme switching to this project with @wrksz/themes.

Follow https://themes.wrksz.dev/llms.mdx/docs/agents and use https://themes.wrksz.dev/llms.txt for anything else.
Detect the framework first. In a Next.js App Router project, render ThemeProvider from @wrksz/themes/next in the root layout and add suppressHydrationWarning to <html>. In other React SSR frameworks, pair ThemeScript with the client provider.
Match the existing styling: point Tailwind's dark variant or the CSS variables at the provider's attribute, and add a theme switcher that fits the current UI.
If the project already uses next-themes, migrate it instead of adding a second provider. Type-check and build the app and report what you changed.`;

const TOGGLE_PROMPT = `Add a theme toggle to this project using the @wrksz/themes theme toggles.

Read https://themes.wrksz.dev/llms.mdx/docs/theme-toggles and pick the variant that fits the existing UI: an icon button for compact headers, the segmented switcher or select when users need a system option.
Make sure a ThemeProvider from @wrksz/themes is already set up; if not, follow https://themes.wrksz.dev/llms.mdx/docs/agents first.
If the project uses the shadcn CLI, install the toggle from its registry URL. Otherwise copy the component and theme-icons.tsx into the components folder.
Replace the icons in theme-icons.tsx with the icon library this project already uses, and remove the Hugeicons dependency if nothing else needs it. If the project does not use shadcn color tokens, map bg-accent, text-muted-foreground, border-input and the other tokens to its own colors.
Place the toggle where the existing navigation puts its controls, then type-check and build the app and report what you changed.`;

const ACTION =
	"inline-flex h-8 cursor-default items-center gap-2 rounded-md bg-fd-background px-3 text-sm font-medium text-fd-foreground outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-fd-secondary focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.97] dark:bg-fd-secondary/40 dark:hover:bg-fd-secondary";

function links(prompt: string) {
	const query = encodeURIComponent(prompt);
	return [
		{ label: "Claude Code", logo: ClaudeCodeLogo, href: `claude-cli://open?q=${query}` },
		{ label: "Codex", logo: CodexLogo, href: `codex://new?prompt=${query}` },
		{
			label: "Cursor",
			logo: CursorLogo,
			href: `cursor://anysphere.cursor-deeplink/prompt?text=${query}`,
		},
	];
}

export function AgentPrompt({
	title,
	description,
	prompt,
	className,
}: {
	title: string;
	description: ReactNode;
	prompt: string;
	className?: string;
}) {
	const [copied, copy] = useCopied(() => navigator.clipboard.writeText(prompt));

	return (
		<div className={cn("not-prose flex flex-col gap-3 rounded-xl bg-fd-card p-4", className)}>
			<div>
				<p className="text-sm font-medium text-fd-foreground">{title}</p>
				<p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
					{description}
				</p>
			</div>
			<div className="flex flex-wrap gap-1.5">
				<button type="button" onClick={copy} className={ACTION}>
					<CopyIcons copied={copied} />
					Copy prompt
					<span aria-live="polite" className="sr-only">
						{copied ? "Copied" : ""}
					</span>
				</button>
				{links(prompt).map((link) => (
					<a key={link.label} href={link.href} className={ACTION}>
						<link.logo className="size-4 shrink-0" />
						{link.label}
					</a>
				))}
			</div>
		</div>
	);
}

export function MigrateWithAI() {
	return (
		<AgentPrompt
			className="my-6"
			title="Migrate with an AI agent"
			description="A ready prompt that points your agent at this guide and the agent checklist. Paste it into Claude Code, Codex or any agent working in your repository."
			prompt={MIGRATE_PROMPT}
		/>
	);
}

export function SetupWithAI() {
	return (
		<AgentPrompt
			className="my-6"
			title="Set up themes with an AI agent"
			description="A ready prompt that points your agent at this guide. Paste it into Claude Code, Codex or any agent working in your repository."
			prompt={SETUP_PROMPT}
		/>
	);
}

export function ToggleWithAI() {
	return (
		<AgentPrompt
			className="my-6"
			title="Add a toggle with an AI agent"
			description="A ready prompt that picks a toggle for your UI, swaps the icons for your icon library and matches your colors. Paste it into Claude Code, Codex or any agent working in your repository."
			prompt={TOGGLE_PROMPT}
		/>
	);
}
