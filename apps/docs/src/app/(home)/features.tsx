"use client";

import {
	ArrowReloadHorizontalIcon,
	CheckmarkBadge01Icon,
	CookieIcon,
	Layers01Icon,
	ReactIcon,
	Typescript01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function C({ children }: { children: string }) {
	return (
		<code className="rounded bg-fd-muted px-1 py-0.5 font-mono text-[0.72rem] text-fd-foreground/80">
			{children}
		</code>
	);
}

type Feature = {
	icon: IconSvgElement;
	title: string;
	description: ReactNode;
};

const features: Feature[] = [
	{
		icon: ReactIcon,
		title: "React 19 ready",
		description: (
			<>
				Fixes the inline script warning, <C>Activity</C>/<C>cacheComponents</C> stale theme,
				and the <C>__name</C> minification bug.
			</>
		),
	},
	{
		icon: ArrowReloadHorizontalIcon,
		title: "Drop-in replacement",
		description: (
			<>
				Same API as <C>next-themes</C>. Change one import.
			</>
		),
	},
	{
		icon: CookieIcon,
		title: "Hybrid storage",
		description: (
			<>
				Use <C>storage="hybrid"</C> for cookie-first SSR correctness plus cross-tab sync via{" "}
				<C>localStorage</C>.
			</>
		),
	},
	{
		icon: Layers01Icon,
		title: "Nested providers",
		description: "Independent theme instances per section. No shared state between them.",
	},
	{
		icon: Typescript01Icon,
		title: "Full type safety",
		description: (
			<>
				<C>createThemes(...)</C> infers your theme union once and types <C>useTheme</C>,{" "}
				<C>useThemeValue</C>, and <C>setTheme</C> everywhere.
			</>
		),
	},
	{
		icon: CheckmarkBadge01Icon,
		title: "Zero runtime deps",
		description:
			"No runtime dependencies. A tiny inline script plus React hooks, nothing more.",
	},
];

export function FeaturesGrid() {
	const shouldReduceMotion = useReducedMotion();

	const headingVariants = {
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

	const gridVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				duration: 0.4,
				ease: EASE_OUT,
				delay: 0.08,
				staggerChildren: shouldReduceMotion ? 0 : 0.05,
				delayChildren: 0.1,
			},
		},
	};

	const cardVariants = {
		hidden: {
			transform: shouldReduceMotion ? "translateY(0px)" : "translateY(12px)",
		},
		show: {
			transform: "translateY(0px)",
			transition: { duration: 0.45, ease: EASE_OUT },
		},
	};

	return (
		<section className="w-full max-w-4xl pb-16 sm:pb-24">
			<m.div
				className="mb-10 text-center"
				variants={headingVariants}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				<p className="mb-2 text-xs font-semibold text-fd-muted-foreground/40">Features</p>
				<h2 className="text-xl font-semibold tracking-tight text-fd-foreground sm:text-2xl">
					What you&apos;re getting.
				</h2>
			</m.div>

			<m.div
				className="grid grid-cols-1 overflow-hidden rounded-xl border border-fd-border bg-fd-border sm:grid-cols-2 lg:grid-cols-3"
				style={{ gap: "1px" }}
				variants={gridVariants}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				{features.map((feature) => (
					<m.div
						key={feature.title}
						className="bg-fd-background p-6 transition-colors hover:bg-fd-card"
						variants={cardVariants}
					>
						<div className="mb-3 inline-flex size-8 items-center justify-center rounded-lg bg-fd-muted text-fd-muted-foreground ring-1 ring-fd-border">
							<HugeiconsIcon
								icon={feature.icon}
								size={16}
								color="currentColor"
								strokeWidth={1.5}
							/>
						</div>
						<h3 className="mb-1.5 text-sm font-semibold text-fd-foreground">
							{feature.title}
						</h3>
						<p className="text-xs leading-relaxed text-fd-muted-foreground">
							{feature.description}
						</p>
					</m.div>
				))}
			</m.div>
		</section>
	);
}
