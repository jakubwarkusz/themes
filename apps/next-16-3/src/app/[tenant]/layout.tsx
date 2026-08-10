import { ThemeProvider } from "@wrksz/themes/next";
import type { Metadata } from "next";
import { tenant } from "next/root-params";
import { type ReactNode, Suspense } from "react";
import "../globals.css";

export const metadata: Metadata = {
	title: "wrksz themes — Next.js fixture",
	description: "Multi-tenant fixture app for verifying @wrksz/themes with Next.js App Router.",
};

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
