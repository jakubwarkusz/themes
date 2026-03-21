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
			<div className="mb-8 text-center">
				<h2 className="text-lg font-semibold text-fd-foreground sm:text-xl">
					What&apos;s next
				</h2>
				<p className="mt-2 text-sm text-fd-muted-foreground">
					The library is actively developed and growing.
				</p>
			</div>

			<div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-0">
				<div
					aria-hidden
					className="absolute top-4 left-0 right-0 hidden h-px sm:block"
					style={{
						background:
							"linear-gradient(to right, transparent 5%, oklch(0.541 0.247 293.009 / 0.25) 20%, oklch(0.541 0.247 293.009 / 0.25) 80%, transparent 95%)",
					}}
				/>

				{plans.map((plan) => (
					<div
						key={plan.label}
						className="relative flex flex-col items-center text-center sm:px-6"
					>
						<div className="relative mb-4 inline-flex size-8 items-center justify-center rounded-full border border-fd-border bg-fd-card text-fd-muted-foreground">
							<HugeiconsIcon
								icon={plan.icon}
								size={14}
								color="currentColor"
								strokeWidth={1.5}
							/>
						</div>
						<p className="text-sm font-semibold text-fd-foreground">{plan.label}</p>
						<p className="mt-1.5 text-xs leading-relaxed text-fd-muted-foreground">
							{plan.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
