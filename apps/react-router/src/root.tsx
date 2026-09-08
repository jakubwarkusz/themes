import { ThemeProvider } from "@wrksz/themes";
import { ThemeScript } from "@wrksz/themes/script";
import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import stylesheet from "./styles.css?url";

export function links() {
	return [{ rel: "stylesheet", href: stylesheet }];
}

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>wrksz themes — React Router fixture</title>
				<ThemeScript
					storage="hybrid"
					defaultTheme="light"
					enableSystem={false}
					scriptProps={{ "data-theme-bootstrap": "true" }}
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<ThemeProvider storage="hybrid" defaultTheme="light" enableSystem={false}>
					{children}
				</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
