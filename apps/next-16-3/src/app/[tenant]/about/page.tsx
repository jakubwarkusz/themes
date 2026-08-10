import Link from "next/link";
import { ThemeControls } from "../theme-controls";

export default async function AboutPage({ params }: PageProps<"/[tenant]/about">) {
	const { tenant } = await params;

	return (
		<main>
			<h1>{tenant} about</h1>
			<ThemeControls />
			<nav>
				<Link href={`/${tenant}`}>Home</Link>
				<Link href={tenant === "alpha" ? "/beta/about" : "/alpha/about"}>
					Switch tenant
				</Link>
			</nav>
		</main>
	);
}
