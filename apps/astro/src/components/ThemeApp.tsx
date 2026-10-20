import { ClientThemeProvider } from "@wrksz/themes/client";
import { ThemeControls } from "./theme-controls";

export function ThemeApp({ title }: { title: string }) {
	return (
		<ClientThemeProvider storage="hybrid" defaultTheme="light" enableSystem={false}>
			<main>
				<h1>{title}</h1>
				<ThemeControls />
				<nav>
					<a href="/">Home</a>
					<a href="/about">About</a>
				</nav>
			</main>
		</ClientThemeProvider>
	);
}
