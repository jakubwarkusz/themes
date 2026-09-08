import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeControls } from "../theme-controls";

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	return (
		<main>
			<h1>about</h1>
			<ThemeControls />
			<nav>
				<Link to="/">Home</Link>
				<Link to="/about">About</Link>
			</nav>
		</main>
	);
}
