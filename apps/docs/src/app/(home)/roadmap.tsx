"use client";

import Image, { type StaticImageData } from "next/image";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import contributions from "@/assets/home/roadmap-contributions.png";
import moreFeatures from "@/assets/home/roadmap-features.png";
import frameworks from "@/assets/home/roadmap-frameworks.png";

type Plan = {
	icon: StaticImageData;
	label: string;
	description: string;
};

const plans: Plan[] = [
	{
		icon: frameworks,
		label: "Framework agnostic",
		description: "Remix, Vite, SvelteKit, and other React-based frameworks.",
	},
	{
		icon: moreFeatures,
		label: "More features",
		description: "More storage adapters and finer-grained resolution options.",
	},
	{
		icon: contributions,
		label: "Open to contributions",
		description: "Bug reports, feature requests, and PRs are welcome on GitHub.",
	},
];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function Roadmap() {
	const shouldReduceMotion = useReducedMotion();

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
			<m.div
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
			</m.div>

			<m.div
				className="grid grid-cols-1 gap-8 sm:grid-cols-3"
				variants={container}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				{plans.map((plan) => (
					<m.div key={plan.label} className="flex flex-col gap-3" variants={item}>
						<Image src={plan.icon} alt="" sizes="48px" className="size-12" />
						<p className="text-sm font-semibold text-fd-foreground">{plan.label}</p>
						<p className="text-xs leading-relaxed text-fd-muted-foreground">
							{plan.description}
						</p>
					</m.div>
				))}
			</m.div>
		</section>
	);
}
