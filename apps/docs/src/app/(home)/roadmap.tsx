import { Globe02Icon, PlugIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

type Plan = {
	icon: IconSvgElement;
	label: string;
	description: string;
};

const plans: Plan[] = [
	{
		icon: Globe02Icon,
		label: "Framework agnostic",
		description: "Remix, Vite, SvelteKit, and any React-based framework. Not just Next.js.",
	},
	{
		icon: SparklesIcon,
		label: "More features",
		description: "New APIs, more storage adapters, and deeper control over theme resolution.",
	},
	{
		icon: PlugIcon,
		label: "Open to contributions",
		description: "Bug reports, feature requests, and PRs are welcome on GitHub.",
	},
];

export function Roadmap() {
	return (
		<section className="w-full max-w-4xl pb-16 sm:pb-24">
			<div className="mb-10 text-center">
				<p className="mb-2 text-xs font-semibold text-fd-muted-foreground/40">
					What&apos;s next
				</p>
				<h2 className="text-xl font-semibold tracking-tight text-fd-foreground sm:text-2xl">
					Actively developed and growing
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
				{plans.map((plan) => (
					<div key={plan.label} className="flex flex-col gap-3">
						<div className="inline-flex size-8 items-center justify-center rounded-lg bg-fd-muted text-fd-muted-foreground ring-1 ring-fd-border">
							<HugeiconsIcon
								icon={plan.icon}
								size={15}
								color="currentColor"
								strokeWidth={1.5}
							/>
						</div>
						<p className="text-sm font-semibold text-fd-foreground">{plan.label}</p>
						<p className="text-xs leading-relaxed text-fd-muted-foreground">
							{plan.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
