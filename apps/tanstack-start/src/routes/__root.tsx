/// <reference types="vite/client" />

import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { ThemeProvider } from "@wrksz/themes";
import { ThemeScript } from "@wrksz/themes/script";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "wrksz themes — TanStack Start fixture" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				<ThemeScript
					storage="hybrid"
					defaultTheme="light"
					enableSystem={false}
					scriptProps={{ "data-theme-bootstrap": "true" }}
				/>
			</head>
			<body>
				<ThemeProvider storage="hybrid" defaultTheme="light" enableSystem={false}>
					{children}
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
