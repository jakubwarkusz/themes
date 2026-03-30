import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { unstable_cache } from "next/cache";
import Image from "next/image";

export const gitConfig = {
	user: "jakubwarkusz",
	repo: "themes",
	branch: "main",
};

export const getLibraryVersion = unstable_cache(
	async (): Promise<string> => {
		try {
			const res = await fetch("https://registry.npmjs.org/@wrksz/themes/latest");
			if (!res.ok) return "";
			const data = (await res.json()) as { version: string };
			return data.version;
		} catch {
			return "";
		}
	},
	["library-version"],
	{ revalidate: 3600 },
);

export const getGitHubStars = unstable_cache(
	async (): Promise<number | null> => {
		try {
			const res = await fetch(
				`https://api.github.com/repos/${gitConfig.user}/${gitConfig.repo}`,
				{ headers: { Accept: "application/vnd.github+json" } },
			);
			if (!res.ok) return null;
			const data = (await res.json()) as { stargazers_count: number };
			return data.stargazers_count;
		} catch {
			return null;
		}
	},
	["github-stars"],
	{ revalidate: 3600 },
);

export function formatStars(count: number): string {
	if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
	return String(count);
}

export function baseOptions(version?: string): BaseLayoutProps {
	return {
		nav: {
			title: (
				<span className="flex items-center gap-1.5">
					<Image
						src="/wrksz.svg"
						alt="@wrksz"
						width={28}
						height={16}
						className="invert dark:invert-0"
					/>
					<span className="text-fd-muted-foreground">/</span>
					<span className="font-medium">themes</span>
					{version && (
						<span className="rounded-md border border-fd-border bg-fd-muted px-1.5 py-0.5 text-xs font-medium text-fd-muted-foreground">
							v{version}
						</span>
					)}
				</span>
			),
		},
		githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
	};
}
