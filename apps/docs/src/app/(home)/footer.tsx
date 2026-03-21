import Image from "next/image";
import Link from "next/link";

const links = [
	{ label: "Docs", href: "/docs" },
	{ label: "API", href: "/docs/api" },
	{ label: "Examples", href: "/docs/examples" },
	{
		label: "GitHub",
		href: "https://github.com/jakubwarkusz/themes",
		external: true,
	},
	{
		label: "npm",
		href: "https://www.npmjs.com/package/@wrksz/themes",
		external: true,
	},
];

export function Footer() {
	return (
		<footer className="w-full max-w-4xl border-t border-fd-border py-8 pb-12">
			<div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-1.5">
					<Image
						src="/wrksz.svg"
						alt="@wrksz"
						width={30}
						height={14}
						className="dark:invert opacity-60"
					/>
					<span className="text-xs text-fd-muted-foreground">/</span>
					<span className="text-xs font-medium text-fd-muted-foreground">themes</span>
				</div>

				<nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
					{links.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							{...(link.external
								? { target: "_blank", rel: "noopener noreferrer" }
								: {})}
							className="text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>

				<p className="text-xs text-fd-muted-foreground">MIT License</p>
			</div>
		</footer>
	);
}
