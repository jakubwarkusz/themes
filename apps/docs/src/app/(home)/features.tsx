"use client";

import Image, { type StaticImageData } from "next/image";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import dropIn from "@/assets/home/feature-drop-in.png";
import nested from "@/assets/home/feature-nested.png";
import react from "@/assets/home/feature-react.png";
import storage from "@/assets/home/feature-storage.png";
import types from "@/assets/home/feature-types.png";
import zeroDeps from "@/assets/home/feature-zero-deps.png";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function C({ children }: { children: string }) {
	return (
		<code className="rounded bg-fd-muted px-[0.35em] py-[0.15em] font-mono text-[0.9em] text-fd-foreground [box-decoration-break:clone]">
			{children}
		</code>
	);
}

type Feature = {
	icon: StaticImageData;
	title: string;
	description: ReactNode;
};

const features: Feature[] = [
	{
		icon: react,
		title: "React 19 ready",
		description: (
			<>
				Fixes the inline script warning, <C>Activity</C>/<C>cacheComponents</C> stale theme,
				and the <C>__name</C> minification bug.
			</>
		),
	},
	{
		icon: dropIn,
		title: "Drop-in replacement",
		description: (
			<>
				Same API as <C>next-themes</C>. Change one import.
			</>
		),
	},
	{
		icon: storage,
		title: "Hybrid storage",
		description: (
			<>
				Use <C>storage="hybrid"</C> for cookie-first SSR correctness plus cross-tab sync via{" "}
				<C>localStorage</C>.
			</>
		),
	},
	{
		icon: nested,
		title: "Nested providers",
		description: "Independent theme instances per section. No shared state between them.",
	},
	{
		icon: types,
		title: "Full type safety",
		description: (
			<>
				<C>createThemes(...)</C> infers your theme union once and types <C>useTheme</C>,{" "}
				<C>useThemeValue</C>, and <C>setTheme</C> everywhere.
			</>
		),
	},
	{
		icon: zeroDeps,
		title: "Zero runtime deps",
		description:
			"No runtime dependencies. A tiny inline script plus React hooks, nothing more.",
	},
];

export function FeaturesGrid() {
	const shouldReduceMotion = useReducedMotion();

	const listVariants = {
		hidden: {},
		show: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.04 } },
	};

	const itemVariants = {
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
				variants={itemVariants}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true }}
			>
				Features
			</m.h2>

			<m.ul
				className="mt-4 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2"
				variants={listVariants}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true }}
			>
				{features.map((feature) => (
					<m.li
						key={feature.title}
						className="flex flex-col gap-1"
						variants={itemVariants}
					>
						<div className="flex items-center gap-2">
							<Image
								src={feature.icon}
								alt=""
								sizes="28px"
								className="size-7 shrink-0"
							/>
							<h3 className="text-sm font-medium text-fd-foreground">
								{feature.title}
							</h3>
						</div>
						<p className="max-w-md text-sm leading-relaxed text-fd-muted-foreground">
							{feature.description}
						</p>
					</m.li>
				))}
			</m.ul>
		</section>
	);
}
