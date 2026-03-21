import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions, getLibraryVersion } from "@/lib/layout.shared";

export default async function Layout({ children }: LayoutProps<"/">) {
	const version = await getLibraryVersion();
	return <HomeLayout {...baseOptions(version)}>{children}</HomeLayout>;
}
