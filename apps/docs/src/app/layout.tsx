import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://themes.wrksz.dev"),
	title: {
		default: "@wrksz/themes",
		template: "%s | @wrksz/themes",
	},
	description:
		"Drop-in replacement for next-themes. Fixes React 19 bugs, adds nested providers, sessionStorage, meta theme-color, server-provided themes, and more.",
	keywords: ["next-themes", "theme", "dark mode", "nextjs", "react", "dark mode toggle"],
};

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen antialiased">
				<RootProvider>{children}</RootProvider>
				<Analytics />
			</body>
		</html>
	);
}
