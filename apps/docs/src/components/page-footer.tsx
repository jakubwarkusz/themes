import { ArrowLeft01Icon, ArrowRight01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as PageTree from "fumadocs-core/page-tree";
import { PageLastUpdate } from "fumadocs-ui/layouts/docs/page";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageFeedback } from "./page-feedback";

type Neighbour = Pick<PageTree.Item, "name" | "url">;

function PageLink({ item, next }: { item: Neighbour; next?: boolean }) {
	return (
		<Link
			href={item.url}
			className={cn(
				"group flex flex-col gap-1 rounded-xl bg-fd-card px-4 py-3.5 transition-[background-color,scale] duration-150 ease-out hover:bg-fd-secondary active:scale-[0.99]",
				next && "items-end text-end sm:col-start-2",
			)}
		>
			<span
				className={cn(
					"inline-flex items-center gap-1 text-xs text-fd-muted-foreground",
					next && "flex-row-reverse",
				)}
			>
				<HugeiconsIcon
					icon={next ? ArrowRight01Icon : ArrowLeft01Icon}
					size={12}
					color="currentColor"
					strokeWidth={2}
					className={cn(
						"transition-transform duration-150 ease-out",
						next ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5",
					)}
				/>
				{next ? "Next" : "Previous"}
			</span>
			<span className="text-sm font-medium text-fd-foreground">{item.name}</span>
		</Link>
	);
}

export function PageFooter({
	page,
	editUrl,
	lastModified,
	previous,
	next,
}: {
	page: string;
	editUrl: string;
	lastModified?: Date;
	previous?: Neighbour;
	next?: Neighbour;
}) {
	return (
		<footer className="mt-12 flex flex-col gap-4">
			<PageFeedback page={page} />
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
				<a
					href={editUrl}
					rel="noreferrer noopener"
					target="_blank"
					className="inline-flex items-center gap-1.5 transition-colors hover:text-fd-foreground"
				>
					<HugeiconsIcon
						icon={Edit01Icon}
						size={12}
						color="currentColor"
						strokeWidth={1.5}
					/>
					Edit on GitHub
				</a>
				{lastModified && <PageLastUpdate date={lastModified} className="text-xs" />}
			</div>
			{(previous || next) && (
				<nav aria-label="Pagination" className="grid gap-2 sm:grid-cols-2">
					{previous && <PageLink item={previous} />}
					{next && <PageLink item={next} next />}
				</nav>
			)}
		</footer>
	);
}
