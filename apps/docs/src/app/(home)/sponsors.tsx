"use client";

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { HoxgerLogo } from "@/components/hoxger-logo";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function Sponsors() {
	const shouldReduceMotion = useReducedMotion();

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
		<m.section
			className="w-full max-w-4xl pb-16 sm:pb-20"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-80px" }}
			transition={{ staggerChildren: shouldReduceMotion ? 0 : 0.04 }}
		>
			<m.h2 className="text-base font-medium text-fd-muted-foreground" variants={item}>
				Sponsors
			</m.h2>

			<m.a
				href="https://hoxger.com"
				target="_blank"
				rel="noreferrer"
				variants={item}
				className="group mt-4 flex items-center justify-between gap-6 rounded-xl bg-fd-card p-5 outline-none transition-colors duration-150 hover:bg-fd-accent focus-visible:ring-2 focus-visible:ring-fd-ring sm:px-6"
			>
				<div className="flex min-w-0 flex-col gap-2">
					<HoxgerLogo className="h-6 w-auto self-start text-fd-foreground" />
					<p className="text-sm text-fd-muted-foreground">
						Crafted down to the last detail.
					</p>
				</div>
				<span className="flex shrink-0 items-center gap-1 text-sm text-fd-muted-foreground transition-colors duration-150 group-hover:text-fd-foreground">
					<span className="max-sm:hidden">hoxger.com</span>
					<HugeiconsIcon
						icon={ArrowUpRight01Icon}
						size={14}
						color="currentColor"
						strokeWidth={2}
					/>
				</span>
			</m.a>

			<m.p className="mt-3 text-sm text-fd-muted-foreground" variants={item}>
				Want your company here?{" "}
				<a
					href="https://github.com/sponsors/jakubwarkusz"
					target="_blank"
					rel="noreferrer"
					className="link-underline-center text-fd-foreground"
				>
					Sponsor on GitHub
				</a>
			</m.p>
		</m.section>
	);
}
