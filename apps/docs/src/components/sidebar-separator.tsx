"use client";

import type { Separator } from "fumadocs-core/page-tree";

export function SidebarSeparatorComponent({ item }: { item: Separator }) {
	return (
		<p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-fd-muted-foreground/50 first:mt-1">
			{item.name}
		</p>
	);
}
