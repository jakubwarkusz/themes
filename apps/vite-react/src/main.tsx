import { ThemeProvider } from "@wrksz/themes";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeControls } from "./theme-controls";
import "./styles.css";

function navigate(href: string) {
	window.history.pushState(null, "", href);
	window.dispatchEvent(new PopStateEvent("popstate"));
}

function Link({ href, children }: { href: string; children: string }) {
	return (
		<a
			href={href}
			onClick={(event) => {
				event.preventDefault();
				navigate(href);
			}}
		>
			{children}
		</a>
	);
}

function Page({ title }: { title: string }) {
	return (
		<main>
			<h1>{title}</h1>
			<ThemeControls />
			<nav>
				<Link href="/">Home</Link>
				<Link href="/about">About</Link>
			</nav>
		</main>
	);
}

function App() {
	const [path, setPath] = useState(window.location.pathname);

	useEffect(() => {
		const onPopState = () => setPath(window.location.pathname);
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	return <Page title={path === "/about" ? "about" : "home"} />;
}

const root = document.getElementById("root");
if (!root) {
	throw new Error("Missing #root");
}

createRoot(root).render(
	<StrictMode>
		<ThemeProvider storage="hybrid" defaultTheme="light" enableSystem={false}>
			<App />
		</ThemeProvider>
	</StrictMode>,
);
