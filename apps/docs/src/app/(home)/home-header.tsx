"use client";

import { GithubIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeSwitch } from "@/components/theme-switch";
import { gitConfig } from "@/lib/layout.shared";

const ICON_BUTTON =
	"flex size-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-fd-card hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]";

export function HomeHeader({ title }: { title: ReactNode }) {
	const { setOpenSearch } = useSearchContext();

	return (
		<header className="sticky top-0 z-40 w-full bg-fd-background/80 px-4 backdrop-blur-md">
			<div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-1">
				<Link
					href="/"
					className="me-auto rounded-md outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
				>
					{title}
				</Link>
				<Link
					href="/docs"
					className="rounded-md px-2 py-1.5 text-sm text-fd-muted-foreground outline-none transition-colors duration-150 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring"
				>
					Docs
				</Link>
				<button
					type="button"
					onClick={() => setOpenSearch(true)}
					aria-label="Search"
					aria-keyshortcuts="Meta+K Control+K"
					className="flex h-8 items-center gap-2 rounded-md px-2 text-sm text-fd-muted-foreground outline-none transition-[color,background-color] duration-150 ease-out hover:bg-fd-card hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring sm:ps-2.5"
				>
					<HugeiconsIcon
						icon={Search01Icon}
						size={15}
						color="currentColor"
						strokeWidth={1.8}
					/>
					<span className="hidden sm:inline">Search</span>
					<span className="ms-3 hidden gap-0.5 text-xs sm:flex">
						<kbd>⌘</kbd>
						<kbd>K</kbd>
					</span>
				</button>
				<ThemeSwitch />
				<a
					href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
					target="_blank"
					rel="noreferrer noopener"
					aria-label="GitHub"
					className={ICON_BUTTON}
				>
					<HugeiconsIcon
						icon={GithubIcon}
						size={16}
						color="currentColor"
						strokeWidth={1.8}
					/>
				</a>
			</div>
		</header>
	);
}
