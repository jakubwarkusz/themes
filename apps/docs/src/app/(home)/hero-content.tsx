"use client";

import {
	CheckmarkCircle01Icon,
	Copy01Icon,
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
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatStars, gitConfig } from "@/lib/layout.shared";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const trustItems: { icon: IconSvgElement; label: string }[] = [
	{ icon: Package01Icon, label: "Zero dependencies" },
	{ icon: ReactIcon, label: "React 19 ready" },
	{ icon: Typescript01Icon, label: "TypeScript" },
];

const PKG_MANAGERS = [
	{ label: "bun", command: "bun add @wrksz/themes" },
	{ label: "npm", command: "npm install @wrksz/themes" },
	{ label: "pnpm", command: "pnpm add @wrksz/themes" },
	{ label: "yarn", command: "yarn add @wrksz/themes" },
] as const;

type PkgManager = (typeof PKG_MANAGERS)[number]["label"];

function InstallSnippet() {
	const [pm, setPm] = useState<PkgManager>("bun");
	const [copied, setCopied] = useState(false);
	const command = PKG_MANAGERS.find((m) => m.label === pm)?.command ?? "";

	async function copy() {
		try {
			await navigator.clipboard.writeText(command);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	}

	return (
		<div className="w-[296px] overflow-hidden rounded-lg border border-fd-border bg-fd-card">
			<div className="flex border-b border-fd-border">
				{PKG_MANAGERS.map((mgr) => (
					<button
						key={mgr.label}
						type="button"
						onClick={() => setPm(mgr.label)}
						className={cn(
							"relative cursor-pointer px-3 py-1.5 text-[11px] font-medium transition-[transform,color] duration-150 active:scale-[0.94]",
							pm === mgr.label
								? "text-fd-foreground"
								: "text-fd-muted-foreground/50 hover:text-fd-muted-foreground",
						)}
					>
						{pm === mgr.label && (
							<motion.span
								layoutId="pm-tab"
								className="absolute inset-x-0 bottom-0 h-px bg-fd-foreground"
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
							/>
						)}
						{mgr.label}
					</button>
				))}
			</div>
			<button
				type="button"
				onClick={copy}
				className="group flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 transition-[background-color] duration-150 hover:bg-fd-muted"
			>
				<span className="select-none font-mono text-xs text-fd-muted-foreground/30">$</span>
				<span className="flex-1 truncate text-left font-mono text-xs text-fd-foreground">
					{command}
				</span>
				<span className="relative size-[13px] shrink-0">
					<span
						className="absolute inset-0 flex items-center justify-center text-fd-muted-foreground/30 transition-[opacity,transform,filter] duration-150 group-hover:text-fd-muted-foreground/70"
						style={{
							opacity: copied ? 0 : 1,
							transform: copied ? "scale(0.6)" : "scale(1)",
							filter: copied ? "blur(4px)" : "blur(0px)",
							transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
						}}
					>
						<HugeiconsIcon
							icon={Copy01Icon}
							size={13}
							color="currentColor"
							strokeWidth={1.5}
						/>
					</span>
					<span
						className="absolute inset-0 flex items-center justify-center text-emerald-500 transition-[opacity,transform,filter] duration-150"
						style={{
							opacity: copied ? 1 : 0,
							transform: copied ? "scale(1)" : "scale(0.6)",
							filter: copied ? "blur(0px)" : "blur(4px)",
							transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
						}}
					>
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							size={13}
							color="currentColor"
							strokeWidth={1.5}
						/>
					</span>
				</span>
			</button>
		</div>
	);
}

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
					className="inline-flex items-center gap-2 rounded-lg bg-fd-foreground px-5 py-2.5 text-sm font-semibold text-fd-background transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
				>
					Get started
				</Link>
				<Link
					href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-medium text-fd-foreground transition-[transform,background-color] duration-150 hover:bg-fd-accent active:scale-[0.97]"
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

			<motion.div className="mt-5" {...fadeUp(0.24)}>
				<InstallSnippet />
			</motion.div>

			<div className="mt-5 flex items-center gap-5">
				{trustItems.map(({ icon, label }, i) => (
					<motion.span
						key={label}
						className="flex items-center gap-1.5 text-xs text-fd-muted-foreground/50"
						{...fadeUp(0.32 + i * 0.05)}
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
