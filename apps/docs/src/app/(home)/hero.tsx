import {
	GithubIcon,
	Package01Icon,
	ReactIcon,
	StarIcon,
	Typescript01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { formatStars, getGitHubStars, gitConfig } from "@/lib/layout.shared";

const trustItems: { icon: IconSvgElement; label: string }[] = [
	{ icon: Package01Icon, label: "Zero dependencies" },
	{ icon: ReactIcon, label: "React 19 ready" },
	{ icon: Typescript01Icon, label: "TypeScript" },
];

export async function Hero() {
	const stars = await getGitHubStars();

	return (
		<section className="relative flex flex-col items-center text-center pt-20 pb-16 sm:pt-28 sm:pb-20 max-w-2xl w-full">
			<h1
				className="bg-linear-to-b from-fd-foreground to-fd-muted-foreground bg-clip-text text-transparent text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
				style={{ textWrap: "balance", lineHeight: 1.15 } as React.CSSProperties}
			>
				@wrksz/themes
			</h1>

			<p
				className="mt-5 max-w-sm text-sm leading-relaxed text-fd-muted-foreground sm:max-w-md sm:text-base"
				style={{ textWrap: "pretty" } as React.CSSProperties}
			>
				Modern theme management for Next.js 16+ and React 19+. Every bug fixed. Every
				missing feature added.
			</p>

			<div className="mt-8 flex items-center gap-3">
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
			</div>

			<div className="mt-5 flex items-center gap-5">
				{trustItems.map(({ icon, label }) => (
					<span
						key={label}
						className="flex items-center gap-1.5 text-xs text-fd-muted-foreground/50"
					>
						<HugeiconsIcon
							icon={icon}
							size={12}
							color="currentColor"
							strokeWidth={1.5}
						/>
						{label}
					</span>
				))}
			</div>
		</section>
	);
}
