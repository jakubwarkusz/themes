import { ThemeProvider } from "@wrksz/themes/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";
import localFont from "next/font/local";
import { Analytics } from "@/components/deferred-analytics";
import { appThemes, themeProviderDefaults } from "@/lib/theme-config";

const inter = localFont({
	src: [
		{ path: "./fonts/Inter.woff2", weight: "100 900", style: "normal" },
		{ path: "./fonts/Inter-Italic.woff2", weight: "100 900", style: "italic" },
	],
	variable: "--font-inter",
	display: "swap",
});

const ioskeleyMono = localFont({
	src: [
		{ path: "./fonts/IoskeleyMono-Regular.woff2", weight: "400", style: "normal" },
		{ path: "./fonts/IoskeleyMono-Bold.woff2", weight: "700", style: "normal" },
		{ path: "./fonts/IoskeleyMono-Italic.woff2", weight: "400", style: "italic" },
	],
	variable: "--font-ioskeley-mono",
	display: "swap",
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
		<html
			lang="en"
			className={`${inter.variable} ${ioskeleyMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex flex-col min-h-dvh antialiased">
				<ThemeProvider {...themeProviderDefaults} themes={appThemes}>
					<RootProvider>{children}</RootProvider>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
