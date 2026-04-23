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
import { motion } from "motion/react";
import type { ReactNode } from "react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const fadeUp = {
	hidden: { opacity: 0, transform: "translateY(20px)" },
	show: {
		opacity: 1,
		transform: "translateY(0px)",
		transition: { duration: 0.5, ease: EASE_OUT },
	},
};

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
				Same API as <C>next-themes</C>. Swap the import and you are done. No migration
				needed.
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
		description:
			"Independent theme instances per section. Each provider manages its own state with a per-instance store.",
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
			"No runtime dependencies. Ships only what the browser needs: a tiny inline script and React hooks.",
	},
];

export function FeaturesGrid() {
	return (
		<section className="w-full max-w-4xl pb-16 sm:pb-24">
			<motion.div
				className="mb-10 text-center"
				variants={fadeUp}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				<p className="mb-2 text-xs font-semibold text-fd-muted-foreground/40">Features</p>
				<h2 className="text-xl font-semibold tracking-tight text-fd-foreground sm:text-2xl">
					Everything next-themes should have been
				</h2>
			</motion.div>

			<motion.div
				className="grid grid-cols-1 overflow-hidden rounded-xl border border-fd-border bg-fd-border sm:grid-cols-2 lg:grid-cols-3"
				style={{ gap: "1px" }}
				variants={fadeUp}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
				transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.08 }}
			>
				{features.map((feature) => (
					<div
						key={feature.title}
						className="bg-fd-background p-6 transition-colors hover:bg-fd-card"
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
					</div>
				))}
			</motion.div>
		</section>
	);
}
