import { ThemeProvider } from "@wrksz/themes/next";
import { tenant } from "next/root-params";
import { type ReactNode, Suspense } from "react";
import "../globals.css";

export function generateStaticParams() {
	return [{ tenant: "alpha" }, { tenant: "beta" }];
}

async function RootParamValue() {
	const currentTenant = await tenant();
	return <span data-testid="root-param">{currentTenant}</span>;
}

export default function TenantLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					storage="hybrid"
					defaultTheme="light"
					scriptProps={{ "data-theme-bootstrap": "true" }}
				>
					<header>
						<Suspense fallback={<span data-testid="root-param">loading</span>}>
							<RootParamValue />
						</Suspense>
					</header>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
