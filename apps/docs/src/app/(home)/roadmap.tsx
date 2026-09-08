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
		description:
			"Vite, React Router, TanStack Start, Astro, and Waku fixtures live in the repo.",
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

	const list = {
		hidden: {},
		show: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.04 } },
	};

	const item = {
		hidden: {
			opacity: 0,
			transform: shouldReduceMotion ? "translateY(0px)" : "translateY(8px)",
		},
		show: {
			opacity: 1,
			transform: "translateY(0px)",
			transition: { duration: 0.4, ease: EASE_OUT },
		},
	};

	return (
		<section className="w-full max-w-4xl pb-16 sm:pb-20">
			<m.h2
				className="text-base font-medium text-fd-muted-foreground"
				variants={item}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				Roadmap
			</m.h2>

			<m.ul
				className="mt-4 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-3"
				variants={list}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				{plans.map((plan) => (
					<m.li key={plan.label} className="flex flex-col gap-1" variants={item}>
						<div className="flex items-center gap-2">
							<Image
								src={plan.icon}
								alt=""
								sizes="28px"
								className="size-7 shrink-0"
							/>
							<h3 className="text-sm font-medium text-fd-foreground">{plan.label}</h3>
						</div>
						<p className="text-sm leading-relaxed text-fd-muted-foreground">
							{plan.description}
						</p>
					</m.li>
				))}
			</m.ul>
		</section>
	);
}
