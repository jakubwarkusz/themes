import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";
import { Inter } from "next/font/google";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "@wrksz/themes",
		template: "%s | @wrksz/themes",
	},
	description:
		"Modern theme management for Next.js 16+ and React 19+. Drop-in replacement for next-themes — fixes every known bug and adds missing features.",
	keywords: ["next-themes", "theme", "dark mode", "nextjs", "react"],
};

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen antialiased">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
