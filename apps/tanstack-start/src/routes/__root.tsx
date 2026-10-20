/// <reference types="vite/client" />

import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { ClientThemeProvider } from "@wrksz/themes/client";
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
				<ClientThemeProvider storage="hybrid" defaultTheme="light" enableSystem={false}>
					{children}
				</ClientThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
