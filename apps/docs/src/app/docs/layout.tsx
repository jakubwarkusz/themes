import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	SidebarFolderComponent,
	SidebarItemComponent,
	SidebarSeparatorComponent,
} from "@/components/sidebar-components";
import { baseOptions, getLibraryVersion } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default async function Layout({ children }: LayoutProps<"/docs">) {
	const version = await getLibraryVersion();
	return (
		<DocsLayout
			tree={source.getPageTree()}
			{...baseOptions(version)}
			sidebar={{
				components: {
					Item: SidebarItemComponent,
					Folder: SidebarFolderComponent,
					Separator: SidebarSeparatorComponent,
				},
			}}
		>
			{children}
		</DocsLayout>
	);
}
