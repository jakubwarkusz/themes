"use client";

import { Download01Icon, Github01Icon, NpmIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import sticker from "@/assets/home/sticker.png";
import { formatCount, gitConfig } from "@/lib/layout.shared";
import { HeroInstall } from "./hero-install";
import { HeroSky } from "./hero-sky";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const CHIP =
	"group inline-flex h-8 cursor-default items-center gap-1.5 rounded-md bg-fd-card px-3 text-sm text-fd-foreground outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-fd-secondary focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.97]";

const STAT =
	"flex items-center gap-1 text-fd-muted-foreground transition-colors duration-150 group-hover:text-fd-foreground";

export function HeroContent({
	stars,
	downloads,
}: {
	stars: number | null;
	downloads: number | null;
}) {
	const reduceMotion = useReducedMotion();

	function fadeUp(delay: number) {
		return {
			initial: {
				opacity: 0,
				transform: reduceMotion ? "translateY(0px)" : "translateY(12px)",
			},
			animate: { opacity: 1, transform: "translateY(0px)" },
			transition: { duration: reduceMotion ? 0.3 : 0.5, ease: EASE_OUT, delay },
		};
	}

	return (
		<>
			<m.div
				className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl sm:h-52"
				{...fadeUp(0)}
			>
				<HeroSky />
				<Image src={sticker} alt="" priority className="relative size-16 sm:size-20" />
			</m.div>

			<m.div className="mt-8 sm:mt-10" {...fadeUp(0.06)}>
				<h1 className="text-lg font-medium leading-snug text-fd-foreground">
					@wrksz/themes
				</h1>
				<p className="max-w-xl text-base leading-relaxed text-fd-muted-foreground">
					Drop-in replacement for next-themes. React 19 hydration fixed, full TypeScript
					types, zero dependencies.
				</p>
			</m.div>

			<m.div className="mt-6 flex flex-wrap items-center gap-2" {...fadeUp(0.12)}>
				<Link
					href="/docs"
					className="inline-flex h-8 cursor-default items-center rounded-md bg-fd-primary px-3 text-sm font-medium text-fd-primary-foreground outline-none transition-[opacity,scale] duration-150 ease-out hover:opacity-90 focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background active:scale-[0.97]"
				>
					Get started
				</Link>
				<Link
					href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
					target="_blank"
					rel="noopener noreferrer"
					className={CHIP}
				>
					<HugeiconsIcon
						icon={Github01Icon}
						size={14}
						color="currentColor"
						strokeWidth={1.8}
					/>
					GitHub
					{stars != null && (
						<>
							<span aria-hidden className="mx-1 h-3.5 w-px bg-fd-border" />
							<span className={STAT}>
								<HugeiconsIcon
									icon={StarIcon}
									size={12}
									color="#f59e0b"
									fill="#f59e0b"
									strokeWidth={0}
								/>
								<span className="tabular-nums">{formatCount(stars)}</span>
							</span>
						</>
					)}
				</Link>
				<Link
					href="https://www.npmjs.com/package/@wrksz/themes"
					target="_blank"
					rel="noopener noreferrer"
					className={CHIP}
				>
					<HugeiconsIcon
						icon={NpmIcon}
						size={14}
						color="currentColor"
						strokeWidth={1.8}
					/>
					npm
					{downloads != null && (
						<>
							<span aria-hidden className="mx-1 h-3.5 w-px bg-fd-border" />
							<span className={STAT}>
								<HugeiconsIcon
									icon={Download01Icon}
									size={12}
									color="currentColor"
									strokeWidth={2}
								/>
								<span className="tabular-nums">{formatCount(downloads)}/wk</span>
							</span>
						</>
					)}
				</Link>
				<HeroInstall />
			</m.div>
		</>
	);
}
