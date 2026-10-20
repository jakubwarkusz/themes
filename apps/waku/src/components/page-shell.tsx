"use client";

import { Link } from "waku/router/client";
import { ThemeControls } from "./theme-controls";

export function PageShell({ title }: { title: string }) {
	return (
		<main>
			<h1>{title}</h1>
			<ThemeControls />
			<nav>
				<Link to="/">Home</Link>
				<Link to="/about">About</Link>
			</nav>
		</main>
	);
}
