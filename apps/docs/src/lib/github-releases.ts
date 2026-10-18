import { unstable_cache } from "next/cache";
import { gitConfig, githubHeaders } from "./layout.shared";

const EMOJI: Record<string, string> = {
	"+1": "👍",
	"-1": "👎",
	laugh: "😄",
	hooray: "🎉",
	confused: "😕",
	heart: "❤️",
	rocket: "🚀",
	eyes: "👀",
};

export type ReleaseReactions = {
	url: string;
	reactions: { emoji: string; count: number }[];
};

type GitHubRelease = {
	tag_name: string;
	html_url: string;
	reactions?: Record<string, number | string>;
};

async function fetchAllReleases() {
	const releases: GitHubRelease[] = [];
	for (let page = 1; ; page++) {
		const res = await fetch(
			`https://api.github.com/repos/${gitConfig.user}/${gitConfig.repo}/releases?per_page=100&page=${page}`,
			{ headers: githubHeaders() },
		);
		if (!res.ok) throw new Error(`GitHub releases: ${res.status}`);
		const batch = (await res.json()) as GitHubRelease[];
		releases.push(...batch);
		if (batch.length < 100) return releases;
	}
}

export const getReleaseReactions = unstable_cache(
	async (): Promise<Record<string, ReleaseReactions>> => {
		try {
			const releases = await fetchAllReleases();
			return Object.fromEntries(
				releases.map((release) => [
					release.tag_name.replace(/^v/, ""),
					{
						url: release.html_url,
						reactions: Object.entries(EMOJI)
							.map(([key, emoji]) => ({
								emoji,
								count: Number(release.reactions?.[key] ?? 0),
							}))
							.filter((reaction) => reaction.count > 0),
					},
				]),
			);
		} catch {
			return {};
		}
	},
	["github-release-reactions"],
	{ revalidate: 3600 },
);

export type GitHubUser = {
	login: string;
	name: string | null;
	bio: string | null;
	location: string | null;
	followers: number;
};

export const getGitHubUser = unstable_cache(
	async (login: string): Promise<GitHubUser | null> => {
		try {
			const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
				headers: githubHeaders(),
			});
			if (!res.ok) return null;
			const user = (await res.json()) as GitHubUser;
			return {
				login: user.login,
				name: user.name,
				bio: user.bio,
				location: user.location,
				followers: user.followers,
			};
		} catch {
			return null;
		}
	},
	["github-user"],
	{ revalidate: 86400 },
);
