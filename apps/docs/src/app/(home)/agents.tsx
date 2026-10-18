import Link from "next/link";
import { AgentPrompt, SETUP_PROMPT } from "@/components/agent-prompt";

export function Agents() {
	return (
		<section id="agents" className="w-full max-w-4xl scroll-mt-72 pb-16 sm:pb-20">
			<h2 className="text-base font-medium text-fd-muted-foreground">Use with agents</h2>
			<AgentPrompt
				className="mt-4"
				title="Set up themes in your project"
				description="A ready prompt that points your agent at the agent guide. Paste it into Claude Code, Codex or any agent working in your repository."
				prompt={SETUP_PROMPT}
			/>
			<p className="mt-3 text-sm text-fd-muted-foreground">
				Coming from next-themes? The{" "}
				<Link href="/docs/migration" className="link-underline-center text-fd-foreground">
					migration guide
				</Link>{" "}
				has a prompt for that.
			</p>
		</section>
	);
}
