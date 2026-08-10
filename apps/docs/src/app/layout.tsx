import { ThemeProvider } from "@wrksz/themes/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import { appThemes, themeProviderDefaults } from "@/lib/theme-config";

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
		"Drop-in replacement for next-themes. Fixes React 19 hydration bugs, adds nested providers, cookie storage for SSR, and full TypeScript types. Zero runtime dependencies.",
	keywords: [
		"next-themes",
		"next-themes alternative",
		"theme",
		"dark mode",
		"nextjs",
		"react 19",
		"dark mode toggle",
		"ssr theme",
		"hydration",
		"theme provider",
	],
};

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-dvh antialiased">
				<ThemeProvider {...themeProviderDefaults} themes={appThemes}>
					<RootProvider>{children}</RootProvider>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
