import { ThemeProvider } from "@wrksz/themes";
import { ThemeControls } from "./theme-controls";

export function ThemeApp({ title }: { title: string }) {
	return (
		<ThemeProvider storage="hybrid" defaultTheme="light" enableSystem={false}>
			<main>
				<h1>{title}</h1>
				<ThemeControls />
				<nav>
					<a href="/">Home</a>
					<a href="/about">About</a>
				</nav>
			</main>
		</ThemeProvider>
	);
}
