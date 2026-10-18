"use client";

import { GithubIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import sticker from "@/assets/home/sticker.png";
import { InstallCommand } from "@/components/install-command";
import { formatStars, gitConfig } from "@/lib/layout.shared";
import { HeroSky } from "./hero-sky";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

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
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F4F2EC] px-5 py-2.5 text-sm font-semibold text-[#1B1A17] shadow-[0_1px_2px_rgb(26_23_16/0.2)] transition-[scale,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
					>
						Get started
					</Link>
					<Link
						href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/15 px-5 py-2.5 text-sm font-medium text-[#F4F2EC] backdrop-blur-md transition-[scale,background-color] duration-150 hover:bg-white/25 active:scale-[0.97]"
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
				<InstallCommand className="w-lg max-w-full" />
			</m.div>
		</>
	);
}
