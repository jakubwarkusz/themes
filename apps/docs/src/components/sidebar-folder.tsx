"use client";

import type { Folder } from "fumadocs-core/page-tree";
import {
	SidebarFolder,
	SidebarFolderContent,
	SidebarFolderLink,
	SidebarFolderTrigger,
} from "fumadocs-ui/components/sidebar/base";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { sidebarActiveClass, sidebarBaseClass, sidebarMutedClass } from "./sidebar-shared";

export function SidebarFolderComponent({ item, children }: { item: Folder; children: ReactNode }) {
	const pathname = usePathname();
	const isActive = item.index ? pathname === item.index.url : false;

	const triggerCls = `${sidebarBaseClass} ${isActive ? sidebarActiveClass : sidebarMutedClass} [&_svg[data-icon]]:ms-auto [&_svg[data-icon]]:size-3 [&_svg[data-icon]]:opacity-40 w-full`;

	return (
		<SidebarFolder active={isActive} collapsible={item.collapsible !== false}>
			{item.index ? (
				<SidebarFolderLink href={item.index.url} active={isActive} className={triggerCls}>
					{item.name}
				</SidebarFolderLink>
			) : (
				<SidebarFolderTrigger className={triggerCls}>{item.name}</SidebarFolderTrigger>
			)}
			<SidebarFolderContent>{children}</SidebarFolderContent>
		</SidebarFolder>
	);
}
