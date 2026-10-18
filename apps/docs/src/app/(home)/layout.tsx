import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions, getLibraryVersion, NavTitle } from "@/lib/layout.shared";
import { HomeHeader } from "./home-header";

export default async function Layout({ children }: LayoutProps<"/">) {
	const version = await getLibraryVersion();
	return (
		<HomeLayout {...baseOptions(version)} nav={{ enabled: false }}>
			<HomeHeader title={<NavTitle version={version} />} />
			{children}
		</HomeLayout>
	);
}
