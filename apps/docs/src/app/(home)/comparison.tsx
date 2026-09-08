"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import sticker from "@/assets/home/sticker.png";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { Bug, Fixed, No, Yes } from "@/components/mdx-badges";
import { ScrollFade } from "@/components/scroll-fade";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const rows = [
	{
		label: "React 19 script warning",
		next: <Bug />,
		wrksz: <Fixed note="useServerInsertedHTML" />,
	},
	{ label: "__name minification bug", next: <Bug />, wrksz: <Fixed /> },
	{
		label: "React 19 Activity / cacheComponents stale theme",
		next: <Bug />,
		wrksz: <Fixed note="useSyncExternalStore" />,
	},
	{
		label: "Multiple classes per theme",
		next: <Bug />,
		wrksz: <Fixed note="correct class removal" />,
	},
	{
		label: "Nested providers",
		next: <No />,
		wrksz: <Yes note="per-instance store" />,
	},
	{ label: "sessionStorage support", next: <No />, wrksz: <Yes /> },
	{
		label: "cookie storage (zero-flash SSR)",
		next: <No />,
		wrksz: <Yes note='storage="cookie"' />,
	},
	{
		label: "Disable storage",
		next: <No />,
		wrksz: <Yes note='storage="none"' />,
	},
	{
		label: "meta theme-color support",
		next: <No />,
		wrksz: <Yes note="themeColor prop" />,
	},
	{
		label: "Server-provided theme",
		next: <No />,
		wrksz: <Yes note="initialTheme prop" />,
	},
	{
		label: "Always follow system preference",
		next: <No />,
		wrksz: <Yes note="followSystem prop" />,
	},
	{
		label: "disableTransitionOnChange per property",
		next: <No />,
		wrksz: <Yes note="CSS string + inline script" />,
	},
	{
		label: "View Transitions on theme switch",
		next: <No />,
		wrksz: <Yes note="enableViewTransition" />,
	},
	{
		label: "Read theme outside React",
		next: <No />,
		wrksz: <Yes note="getTheme()" />,
	},
	{
		label: "Generic types",
		next: <No />,
		wrksz: <Yes note="useTheme<AppTheme>()" />,
	},
	{ label: "Zero runtime dependencies", next: <Yes />, wrksz: <Yes /> },
];

export function Comparison() {
	const shouldReduceMotion = useReducedMotion();

	const fadeUp = {
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
			<m.div
				className="mb-4"
				variants={fadeUp}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
			>
				<h2 className="text-base font-medium text-fd-muted-foreground">Comparison</h2>
				<p className="mt-1 text-sm text-fd-foreground/80">
					next-themes still has React 19 bugs open.
				</p>
			</m.div>

			<m.div
				className="sm:hidden"
				variants={fadeUp}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
				transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.08 }}
			>
				{rows.map((row, i) => (
					<div
						key={row.label}
						className={`flex items-center justify-between gap-4 py-2.5 ${i < rows.length - 1 ? "border-b border-fd-border/60" : ""}`}
					>
						<span className="text-sm text-fd-foreground/80">{row.label}</span>
						{row.wrksz}
					</div>
				))}
			</m.div>

			<m.div
				className="hidden sm:block"
				variants={fadeUp}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
				transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.08 }}
			>
				<ScrollFade className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-sm tabular-nums">
						<thead>
							<tr className="border-b border-fd-border">
								<th
									scope="col"
									className="py-2 pr-6 align-bottom font-medium text-fd-foreground"
								>
									Feature
								</th>
								<th
									scope="col"
									className="py-2 pr-6 align-bottom font-medium whitespace-nowrap text-fd-muted-foreground"
								>
									next-themes
								</th>
								<th
									scope="col"
									className="py-2 align-bottom font-medium whitespace-nowrap text-fd-foreground"
								>
									<span className="flex items-center gap-1.5">
										<Image
											src={sticker}
											alt=""
											sizes="16px"
											className="size-4"
										/>
										@wrksz/themes
									</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row, i) => (
								<tr
									key={row.label}
									className={
										i < rows.length - 1
											? "border-b border-fd-border/60"
											: undefined
									}
								>
									<td className="py-2.5 pr-6 align-top text-fd-foreground/80">
										{row.label}
									</td>
									<td className="py-2.5 pr-6 align-top">{row.next}</td>
									<td className="py-2.5 align-top">{row.wrksz}</td>
								</tr>
							))}
						</tbody>
					</table>
				</ScrollFade>
			</m.div>

			<m.div
				className="mt-4"
				variants={fadeUp}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-80px" }}
				transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.12 }}
			>
				<Link
					href="/docs/why-not-next-themes"
					className="group inline-flex items-center gap-1 text-sm text-fd-muted-foreground transition-colors duration-150 hover:text-fd-foreground"
				>
					Read the full breakdown
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						size={14}
						color="currentColor"
						strokeWidth={1.8}
						className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
					/>
				</Link>
			</m.div>
		</section>
	);
}
