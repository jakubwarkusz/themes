"use client";

import type { Folder, Item, Separator } from "fumadocs-core/page-tree";
import {
	SidebarFolder,
	SidebarFolderContent,
	SidebarFolderLink,
	SidebarFolderTrigger,
	SidebarItem,
	useFolderDepth,
} from "fumadocs-ui/components/sidebar/base";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const base =
	"flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors duration-100 hover:text-fd-foreground";

const muted = "text-fd-muted-foreground";
const active = "text-fd-foreground font-medium";

function indent(depth: number) {
	return depth > 0 ? { paddingInlineStart: `${depth * 12 + 12}px` } : undefined;
}

export function SidebarItemComponent({ item }: { item: Item }) {
	const pathname = usePathname();
	const depth = useFolderDepth();
	const isActive = pathname === item.url;

	return (
		<SidebarItem
			href={item.url}
			active={isActive}
			className={`${base} ${isActive ? active : muted}`}
			style={indent(depth)}
		>
			{item.name}
		</SidebarItem>
	);
}

export function SidebarFolderComponent({ item, children }: { item: Folder; children: ReactNode }) {
	const pathname = usePathname();
	const isActive = item.index ? pathname === item.index.url : false;

	const triggerCls = `${base} ${isActive ? active : muted} [&_svg[data-icon]]:ms-auto [&_svg[data-icon]]:size-3 [&_svg[data-icon]]:opacity-40 w-full`;

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

export function SidebarSeparatorComponent({ item }: { item: Separator }) {
	return (
		<p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-fd-muted-foreground/50 first:mt-1">
			{item.name}
		</p>
	);
}
