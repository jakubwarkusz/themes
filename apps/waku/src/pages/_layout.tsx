import { ClientThemeProvider } from "@wrksz/themes/client";
import type { ReactNode } from "react";
import "../styles.css";

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<ClientThemeProvider storage="hybrid" defaultTheme="light" enableSystem={false}>
			{children}
		</ClientThemeProvider>
	);
}

export const getConfig = async () => {
	return {
		render: "static",
	} as const;
};
