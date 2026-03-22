import { ArrowRight01Icon, Bug01Icon, GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/button";

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
				<Button href="/docs">
					Get started
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						size={14}
						color="currentColor"
						strokeWidth={2.5}
					/>
				</Button>
				<Button
					href="https://github.com/jakubwarkusz/themes"
					target="_blank"
					rel="noopener noreferrer"
					variant="secondary"
				>
					<HugeiconsIcon
						icon={GithubIcon}
						size={14}
						color="currentColor"
						strokeWidth={1.5}
					/>
					GitHub
				</Button>
			</div>
		</section>
	);
}
