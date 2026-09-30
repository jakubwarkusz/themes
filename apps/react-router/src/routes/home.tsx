import { Link } from "react-router";
import { ThemeControls } from "../theme-controls";

export default function Home() {
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
