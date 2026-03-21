import { ArrowRight01Icon, Bug01Icon, GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export function Hero() {
	return (
		<section className="relative flex flex-col items-center text-center pt-16 pb-16 sm:pt-24 sm:pb-20 max-w-2xl w-full">
			<div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground">
				<HugeiconsIcon icon={Bug01Icon} size={12} color="currentColor" strokeWidth={1.5} />
				Drop-in replacement for next-themes
			</div>

			<h1
				className="text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl lg:text-6xl"
				style={{ textWrap: "balance" } as React.CSSProperties}
			>
				@wrksz/themes
			</h1>

			<p
				className="mt-4 max-w-sm text-sm leading-relaxed text-fd-muted-foreground sm:mt-5 sm:max-w-md sm:text-base"
				style={{ textWrap: "pretty" } as React.CSSProperties}
			>
				Modern theme management for Next.js 16+ and React 19+. Fixes every known bug in
				next-themes and adds the features that were missing.
			</p>

			<div className="mt-6 flex w-full max-w-xs flex-col items-stretch gap-2 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-3">
				<Link
					href="/docs"
					className="inline-flex items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.96]"
				>
					Get started
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						size={14}
						color="currentColor"
						strokeWidth={2.5}
					/>
				</Link>
				<Link
					href="https://github.com/jakubwarkusz/themes"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center justify-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-medium text-fd-foreground transition-[transform,background-color] duration-150 hover:bg-fd-accent active:scale-[0.96]"
				>
					<HugeiconsIcon
						icon={GithubIcon}
						size={14}
						color="currentColor"
						strokeWidth={1.5}
					/>
					GitHub
				</Link>
			</div>
		</section>
	);
}
