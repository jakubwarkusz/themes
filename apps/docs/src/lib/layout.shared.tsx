import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { unstable_cache } from "next/cache";
import { NavTitleSlot } from "@/components/nav-title";
import { ThemeSwitch } from "@/components/theme-switch";

export const gitConfig = {
	user: "jakubwarkusz",
	repo: "themes",
	branch: "main",
};

export const getLibraryVersion = unstable_cache(
	async (): Promise<string> => {
		try {
			const res = await fetch("https://registry.npmjs.org/@wrksz/themes");
			if (!res.ok) return "";
			const data = (await res.json()) as {
				"dist-tags"?: { latest?: string };
			};
			return data["dist-tags"]?.latest ?? "";
		} catch {
			return "";
		}
	},
	["library-version-latest"],
	{ revalidate: 3600 },
);

export function githubHeaders() {
	const token = process.env.GITHUB_TOKEN;
	return {
		Accept: "application/vnd.github+json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
}

export const getGitHubStars = unstable_cache(
	async (): Promise<number | null> => {
		try {
			const res = await fetch(
				`https://api.github.com/repos/${gitConfig.user}/${gitConfig.repo}`,
				{ headers: githubHeaders() },
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

export const getWeeklyDownloads = unstable_cache(
	async (): Promise<number | null> => {
		try {
			const res = await fetch(
				"https://api.npmjs.org/downloads/point/last-week/@wrksz/themes",
			);
			if (!res.ok) return null;
			const data = (await res.json()) as { downloads?: number };
			return typeof data.downloads === "number" ? data.downloads : null;
		} catch {
			return null;
		}
	},
	["npm-weekly-downloads"],
	{ revalidate: 3600 },
);

export function formatCount(count: number): string {
	if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
	return String(count);
}

export function baseOptions(): BaseLayoutProps {
	return {
		githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
		slots: { navTitle: NavTitleSlot, themeSwitch: ThemeSwitch },
	};
}
