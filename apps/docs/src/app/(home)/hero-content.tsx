"use client";

import {
	GithubIcon,
	Package01Icon,
	ReactIcon,
	StarIcon,
	Typescript01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { formatStars, gitConfig } from "@/lib/layout.shared";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const trustItems: { icon: IconSvgElement; label: string }[] = [
	{ icon: Package01Icon, label: "Zero dependencies" },
	{ icon: ReactIcon, label: "React 19 ready" },
	{ icon: Typescript01Icon, label: "TypeScript" },
];

export function HeroContent({ stars }: { stars: number | null }) {
	const reduceMotion = useReducedMotion();

	function fadeUp(delay: number) {
		return {
			initial: {
				opacity: 0,
				transform: reduceMotion ? "translateY(0px)" : "translateY(20px)",
			},
			animate: { opacity: 1, transform: "translateY(0px)" },
			transition: { duration: reduceMotion ? 0.3 : 0.55, ease: EASE_OUT, delay },
		};
	}

	return (
		<>
			<motion.h1
				className="bg-linear-to-b from-fd-foreground to-fd-muted-foreground bg-clip-text text-transparent text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
				style={{ textWrap: "balance", lineHeight: 1.15 } as React.CSSProperties}
				{...fadeUp(0)}
			>
				@wrksz/themes
			</motion.h1>

			<motion.p
				className="mt-5 max-w-sm text-sm leading-relaxed text-fd-muted-foreground sm:max-w-md sm:text-base"
				style={{ textWrap: "pretty" } as React.CSSProperties}
				{...fadeUp(0.08)}
			>
				Modern theme management for Next.js 16+ and React 19+. Every bug fixed. Every
				missing feature added.
			</motion.p>

			<motion.div className="mt-8 flex items-center gap-3" {...fadeUp(0.16)}>
				<Link
					href="/docs"
					className="inline-flex items-center gap-2 rounded-lg bg-fd-foreground px-5 py-2.5 text-sm font-semibold text-fd-background transition-opacity hover:opacity-80 active:scale-[0.97]"
				>
					Get started
				</Link>
				<Link
					href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent active:scale-[0.97]"
				>
					<HugeiconsIcon
						icon={GithubIcon}
						size={14}
						color="currentColor"
						strokeWidth={1.5}
					/>
					GitHub
					{stars != null && (
						<>
							<span className="text-fd-border">·</span>
							<HugeiconsIcon
								icon={StarIcon}
								size={13}
								color="#f59e0b"
								fill="#f59e0b"
								strokeWidth={0}
							/>
							{formatStars(stars)}
						</>
					)}
				</Link>
			</motion.div>

			<div className="mt-5 flex items-center gap-5">
				{trustItems.map(({ icon, label }, i) => (
					<motion.span
						key={label}
						className="flex items-center gap-1.5 text-xs text-fd-muted-foreground/50"
						{...fadeUp(0.22 + i * 0.05)}
					>
						<HugeiconsIcon
							icon={icon}
							size={12}
							color="currentColor"
							strokeWidth={1.5}
						/>
						{label}
					</motion.span>
				))}
			</div>
		</>
	);
}
