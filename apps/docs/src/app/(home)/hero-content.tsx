"use client";

import {
	CheckmarkCircle01Icon,
	Copy01Icon,
	GithubIcon,
	StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import sticker from "@/assets/home/sticker.png";
import { formatStars, gitConfig } from "@/lib/layout.shared";
import { HeroSky } from "./hero-sky";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const PKG_MANAGERS = [
	{ label: "bun", command: "bun add @wrksz/themes" },
	{ label: "npm", command: "npm install @wrksz/themes" },
	{ label: "pnpm", command: "pnpm add @wrksz/themes" },
	{ label: "yarn", command: "yarn add @wrksz/themes" },
] as const;

type PkgManager = (typeof PKG_MANAGERS)[number]["label"];

function InstallSnippet() {
	const [pm, setPm] = useState<PkgManager>("pnpm");
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
		<div className="flex w-lg max-w-full flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-card sm:h-12 sm:flex-row sm:items-stretch">
			<div className="relative grid h-11 shrink-0 grid-cols-4 items-center self-start border-fd-border p-1.5 max-sm:w-full max-sm:border-b sm:h-auto sm:self-stretch sm:border-r">
				<span
					aria-hidden
					className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-0.75rem)/4)] rounded-md bg-fd-muted ring-1 ring-fd-border transition-transform duration-200 ease-out motion-reduce:transition-none"
					style={{
						transform: `translateX(${PKG_MANAGERS.findIndex((mgr) => mgr.label === pm) * 100}%)`,
					}}
				/>
				{PKG_MANAGERS.map((mgr) => (
					<button
						key={mgr.label}
						type="button"
						aria-pressed={pm === mgr.label}
						onClick={() => setPm(mgr.label)}
						className={cn(
							"relative h-full w-full cursor-pointer rounded-md sm:w-12 text-xs font-medium transition-[transform,color] duration-150 active:scale-[0.96]",
							pm === mgr.label
								? "text-fd-foreground"
								: "text-fd-muted-foreground/60 hover:text-fd-muted-foreground",
						)}
					>
						{mgr.label}
					</button>
				))}
			</div>
			<button
				type="button"
				onClick={copy}
				className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 px-4 py-3 transition-[background-color] duration-150 hover:bg-fd-muted sm:py-0"
			>
				<span className="select-none font-mono text-[13px] text-fd-muted-foreground/40">
					$
				</span>
				<span className="flex-1 truncate text-left font-mono text-[13px] text-fd-foreground">
					{command}
				</span>
				<span className="relative size-3.25 shrink-0">
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
			{/* The painted sky: by day in the light theme, by night in the dark
			    one, repainted on the switch (hero-sky.tsx). */}
			<m.div
				className="relative flex min-h-90 w-full flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-12 sm:aspect-5/2 sm:min-h-0"
				{...fadeUp(0)}
			>
				<HeroSky />
				<div
					aria-hidden
					className="absolute inset-0 bg-[linear-gradient(180deg,rgb(26_23_16/0.04),rgb(26_23_16/0.3))]"
				/>
				<Image src={sticker} alt="" priority className="relative size-20 sm:size-24" />
				<h1
					className="relative mt-3 text-[clamp(1.75rem,9.5vw,3rem)] font-semibold tracking-tight text-[#F4F2EC] [text-shadow:0_2px_18px_rgb(26_23_16/0.35)] sm:text-7xl"
					style={{ textWrap: "balance", lineHeight: 1.05 } as React.CSSProperties}
				>
					@wrksz/themes
				</h1>
				<p
					className="relative mt-4 max-w-sm text-sm leading-relaxed text-[#F4F2EC]/90 [text-shadow:0_1px_10px_rgb(26_23_16/0.4)] sm:max-w-md sm:text-base"
					style={{ textWrap: "pretty" } as React.CSSProperties}
				>
					Drop-in replacement for next-themes. React 19 hydration fixed, full TypeScript
					types, zero dependencies.
				</p>
				<div className="relative mt-7 flex w-full max-w-64 flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
					<Link
						href="/docs"
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F4F2EC] px-5 py-2.5 text-sm font-semibold text-[#1B1A17] shadow-[0_1px_2px_rgb(26_23_16/0.2)] transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
					>
						Get started
					</Link>
					<Link
						href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/15 px-5 py-2.5 text-sm font-medium text-[#F4F2EC] backdrop-blur-md transition-[transform,background-color] duration-150 hover:bg-white/25 active:scale-[0.97]"
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
								<span className="opacity-50">·</span>
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
				</div>
			</m.div>

			<m.div className="mt-6 flex w-full justify-center" {...fadeUp(0.16)}>
				<InstallSnippet />
			</m.div>
		</>
	);
}
