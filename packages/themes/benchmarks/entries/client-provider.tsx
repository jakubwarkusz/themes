import { ClientThemeProvider } from "@wrksz/themes/client/provider";
import type { ReactElement, ReactNode } from "react";

export function ClientProviderFixture({ children }: { children: ReactNode }): ReactElement {
	return <ClientThemeProvider defaultTheme="dark">{children}</ClientThemeProvider>;
}
