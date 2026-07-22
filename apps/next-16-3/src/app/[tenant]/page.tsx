import Link from "next/link";
import { ThemeControls } from "./theme-controls";

export default async function TenantPage({ params }: PageProps<"/[tenant]">) {
	const { tenant } = await params;

	return (
		<main>
			<h1>{tenant} home</h1>
			<ThemeControls />
			<nav>
				<Link href={`/${tenant}/about`}>About</Link>
				<Link href={tenant === "alpha" ? "/beta" : "/alpha"}>Switch tenant</Link>
			</nav>
		</main>
	);
}
