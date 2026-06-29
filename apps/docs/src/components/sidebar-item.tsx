"use client";

import type { Item } from "fumadocs-core/page-tree";
import { SidebarItem, useFolderDepth } from "fumadocs-ui/components/sidebar/base";
import { usePathname } from "next/navigation";
import {
	sidebarActiveClass,
	sidebarBaseClass,
	sidebarIndent,
	sidebarMutedClass,
} from "./sidebar-shared";

export function SidebarItemComponent({ item }: { item: Item }) {
	const pathname = usePathname();
	const depth = useFolderDepth();
	const isActive = pathname === item.url;

	return (
		<SidebarItem
			href={item.url}
			active={isActive}
			className={`${sidebarBaseClass} ${isActive ? sidebarActiveClass : sidebarMutedClass}`}
			style={sidebarIndent(depth)}
		>
			{item.name}
		</SidebarItem>
	);
}
