import {
	ArrowReloadHorizontalIcon,
	CheckmarkBadge01Icon,
	FolderFileStorageIcon,
	Layers01Icon,
	ReactIcon,
	Typescript01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

function C({ children }: { children: string }) {
	return <code className="font-mono text-[0.72rem] text-fd-foreground">{children}</code>;
}

type Feature = {
	icon: IconSvgElement;
	title: string;
	description: ReactNode;
};

const features: Feature[] = [
	{
		icon: ReactIcon,
		title: "React 19 ready",
		description: (
			<>
				Fixes the inline script warning, <C>Activity</C>/<C>cacheComponents</C> stale theme,
				and the <C>__name</C> minification bug.
			</>
		),
	},
	{
		icon: ArrowReloadHorizontalIcon,
		title: "Drop-in replacement",
		description: (
			<>
				Same API as <C>next-themes</C>. Swap the import and you are done. No migration
				needed.
			</>
		),
	},
	{
		icon: Layers01Icon,
		title: "Nested providers",
		description:
			"Independent theme instances per section. Each provider manages its own state with a per-instance store.",
	},
	{
		icon: Typescript01Icon,
		title: "Full type safety",
		description: (
			<>
				Generic <C>{"useTheme<AppTheme>()"}</C> constrains <C>setTheme</C> to your exact
				theme union. No casting needed.
			</>
		),
	},
	{
		icon: FolderFileStorageIcon,
		title: "Flexible storage",
		description: (
			<>
				<C>localStorage</C>, <C>sessionStorage</C>, or <C>none</C>. Disable persistence for
				forced or server-driven themes.
			</>
		),
	},
	{
		icon: CheckmarkBadge01Icon,
		title: "Zero runtime deps",
		description:
			"No runtime dependencies. Ships only what the browser needs: a tiny inline script and React hooks.",
	},
];

export function FeaturesGrid() {
	return (
		<section className="w-full max-w-4xl pb-16 sm:pb-24">
			<div className="mb-8 text-center">
				<h2 className="text-lg font-semibold text-fd-foreground sm:text-xl">
					Everything next-themes should have been
				</h2>
				<p className="mt-2 text-sm text-fd-muted-foreground">
					Bug fixes and new features, zero API changes.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{features.map((feature) => (
					<div
						key={feature.title}
						className="group relative overflow-hidden rounded-xl border border-fd-border bg-fd-card p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_oklch(0_0_0/0.1),0_8px_32px_oklch(0_0_0/0.1)]"
					>
						<div
							aria-hidden
							className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[oklch(0.541_0.247_293.009/40%)] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
						/>
						<div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-[oklch(0.541_0.247_293.009/10%)] text-fd-primary ring-1 ring-inset ring-[oklch(0.541_0.247_293.009/20%)]">
							<HugeiconsIcon
								icon={feature.icon}
								size={18}
								color="currentColor"
								strokeWidth={1.5}
							/>
						</div>
						<h3 className="mb-1.5 text-sm font-semibold text-fd-foreground">
							{feature.title}
						</h3>
						<p className="text-xs leading-relaxed text-fd-muted-foreground">
							{feature.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
