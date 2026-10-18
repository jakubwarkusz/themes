"use client";

import { ClaudeCodeLogo, CodexLogo, CursorLogo } from "./ai-logos";
import { CopyIcons, useCopied } from "./copy-button";

const PROMPT = `Migrate this project from next-themes to @wrksz/themes.

Follow https://themes.wrksz.dev/llms.mdx/docs/migration and https://themes.wrksz.dev/llms.mdx/docs/agents.
Keep the existing storageKey, theme names and CSS selectors so saved preferences survive. next-themes defaults to attribute="data-theme", so set it explicitly if the project relied on that.
Remove next-themes only after no imports are left, then type-check and build the app and report what you changed.`;

const ACTION =
	"inline-flex h-8 cursor-default items-center gap-2 rounded-md bg-fd-background px-3 text-sm font-medium text-fd-foreground outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-fd-secondary focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.97] dark:bg-fd-secondary/40 dark:hover:bg-fd-secondary";

const query = encodeURIComponent(PROMPT);

const LINKS = [
	{ label: "Claude Code", logo: ClaudeCodeLogo, href: `claude-cli://open?q=${query}` },
	{ label: "Codex", logo: CodexLogo, href: `codex://new?prompt=${query}` },
	{
		label: "Cursor",
		logo: CursorLogo,
		href: `cursor://anysphere.cursor-deeplink/prompt?text=${query}`,
	},
];

export function MigrateWithAI() {
	const [copied, copy] = useCopied(() => navigator.clipboard.writeText(PROMPT));

	return (
		<div className="not-prose my-6 flex flex-col gap-3 rounded-xl bg-fd-card p-4">
			<div>
				<p className="text-sm font-medium text-fd-foreground">Migrate with an AI agent</p>
				<p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
					A ready prompt that points your agent at this guide and the agent checklist.
					Paste it into Claude Code, Codex or any agent working in your repository.
				</p>
			</div>
			<div className="flex flex-wrap gap-1.5">
				<button type="button" onClick={copy} aria-live="polite" className={ACTION}>
					<CopyIcons copied={copied} />
					{copied ? "Copied" : "Copy prompt"}
				</button>
				{LINKS.map((link) => (
					<a key={link.label} href={link.href} className={ACTION}>
						<link.logo className="size-4 shrink-0" />
						{link.label}
					</a>
				))}
			</div>
		</div>
	);
}
