import Link from "next/link";
import { gitConfig } from "@/lib/layout.shared";
import { FooterSearch } from "./footer-search";

const YEAR = new Date().getFullYear();

const links = [
	{ label: "Docs", href: "/docs" },
	{
		label: "GitHub",
		href: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
		external: true,
	},
	{ label: "npm", href: "https://www.npmjs.com/package/@wrksz/themes", external: true },
];

export function Footer() {
	return (
		<footer className="flex w-full max-w-4xl flex-col gap-3 border-t border-fd-border py-5 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
			<p className="text-fd-muted-foreground">
				© {YEAR}{" "}
				<a
					href="https://wrksz.dev"
					target="_blank"
					rel="noopener noreferrer"
					className="group -my-2 py-2 transition-colors duration-150 hover:text-fd-foreground"
				>
					<span className="link-underline-center">wrksz.dev</span>
				</a>{" "}
				· MIT
			</p>
			<nav className="flex items-center gap-4">
				<FooterSearch />
				{links.map((link) => (
					<Link
						key={link.label}
						href={link.href}
						{...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
						className="group -my-2 py-2 text-fd-muted-foreground transition-colors duration-150 hover:text-fd-foreground"
					>
						<span className="link-underline-center">{link.label}</span>
					</Link>
				))}
			</nav>
		</footer>
	);
}
