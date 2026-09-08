import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeControls } from "../theme-controls";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<main>
			<h1>home</h1>
			<ThemeControls />
			<nav>
				<Link to="/">Home</Link>
				<Link to="/about">About</Link>
			</nav>
		</main>
	);
}
