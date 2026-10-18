"use client";

import type { Separator } from "fumadocs-core/page-tree";

export function SidebarSeparatorComponent({ item }: { item: Separator }) {
	return (
		<p className="mt-7 mb-2 px-3 text-xs text-fd-muted-foreground first:mt-1">{item.name}</p>
	);
}
