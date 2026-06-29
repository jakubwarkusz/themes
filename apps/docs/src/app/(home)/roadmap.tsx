"use client";

import { Globe02Icon, PlugIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";

type Plan = {
	icon: IconSvgElement;
	label: string;
	description: string;
};

const plans: Plan[] = [
	{
		icon: Globe02Icon,
		label: "Framework agnostic",
		description: "Remix, Vite, SvelteKit, and other React-based frameworks.",
	},
	{
		icon: SparklesIcon,
		label: "More features",
		description: "More storage adapters and finer-grained resolution options.",
	},
	{
		icon: PlugIcon,
		label: "Open to contributions",
		description: "Bug reports, feature requests, and PRs are welcome on GitHub.",
	},
];

export function Roadmap() {
	const shouldReduceMotion = useReducedMotion();

	const EASE_OUT = [0.23, 1, 0.32, 1] as const;

	const container = {
		hidden: {},
		show: {
			transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07 },
		},
	};

	const item = {
		hidden: {
			opacity: 0,
			transform: shouldReduceMotion ? "translateY(0px)" : "translateY(20px)",
		},
		show: {
			opacity: 1,
			transform: "translateY(0px)",
			transition: { duration: 0.5, ease: EASE_OUT },
		},
	};

	return (
		<section className="w-full max-w-4xl pb-16 sm:pb-24">
			<motion.div
				className="mb-10 text-center"
				variants={item}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				<p className="mb-2 text-xs font-semibold text-fd-muted-foreground/40">Roadmap</p>
				<h2 className="text-xl font-semibold tracking-tight text-fd-foreground sm:text-2xl">
					What&apos;s next.
				</h2>
			</motion.div>

			<motion.div
				className="grid grid-cols-1 gap-8 sm:grid-cols-3"
				variants={container}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				{plans.map((plan) => (
					<motion.div key={plan.label} className="flex flex-col gap-3" variants={item}>
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
					</motion.div>
				))}
			</motion.div>
		</section>
	);
}
