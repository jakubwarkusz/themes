import { ThemeScript } from "@wrksz/themes/script";
import type { ReactNode } from "react";

export default async function RootElement({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>wrksz themes — Waku fixture</title>
				<ThemeScript
					storage="hybrid"
					defaultTheme="light"
					enableSystem={false}
					scriptProps={{ "data-theme-bootstrap": "true" }}
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}

export const getConfig = async () => {
	return {
		render: "static",
	} as const;
};
