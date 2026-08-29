import { ThemeProvider } from "@wrksz/themes/next/extended";
import type { ReactElement, ReactNode } from "react";

export async function ExtendedNextProviderFixture({
	children,
}: {
	children: ReactNode;
}): Promise<ReactElement> {
	return (
		<ThemeProvider
			storage="cookie"
			defaultTheme="system"
			themes={["paper", "midnight"]}
			systemThemeMap={{ light: "paper", dark: "midnight" }}
			enableSameDocumentSync
		>
			{children}
		</ThemeProvider>
	);
}
