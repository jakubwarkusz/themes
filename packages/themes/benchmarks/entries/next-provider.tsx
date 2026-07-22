import type { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "@wrksz/themes/next";

export async function NextProviderFixture({
	children,
}: {
	children: ReactNode;
}): Promise<ReactElement> {
	return (
		<ThemeProvider storage="cookie" defaultTheme="system">
			{children}
		</ThemeProvider>
	);
}
