import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions, getLibraryVersion } from "@/lib/layout.shared";
import { HomeHeader } from "./home-header";

export default async function Layout({ children }: LayoutProps<"/">) {
	const version = await getLibraryVersion();
	return (
		<HomeLayout {...baseOptions()} nav={{ enabled: false }}>
			<HomeHeader version={version} />
			{children}
		</HomeLayout>
	);
}
