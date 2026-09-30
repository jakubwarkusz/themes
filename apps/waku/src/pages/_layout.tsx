import { ThemeProvider } from "@wrksz/themes";
import type { ReactNode } from "react";
import "../styles.css";

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider storage="hybrid" defaultTheme="light" enableSystem={false}>
			{children}
		</ThemeProvider>
	);
}

export const getConfig = async () => {
	return {
		render: "static",
	} as const;
};
