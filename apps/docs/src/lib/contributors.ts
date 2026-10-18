import { type Release } from "./changelog";
import { type GitHubUser, getGitHubUser } from "./github-releases";
import { gitConfig } from "./layout.shared";

export type Person = {
	login: string;
	user: GitHubUser | null;
	total: number;
	first: { version: string; id: string };
};

export async function getPeople(releases: Release[]) {
	const totals = new Map<string, number>();
	const first = new Map<string, Person["first"]>();
	for (const release of releases.toReversed())
		for (const group of release.groups)
			for (const item of group.items) {
				const login = item.author?.login ?? gitConfig.user;
				totals.set(login, (totals.get(login) ?? 0) + 1);
				if (!first.has(login))
					first.set(login, { version: release.version, id: release.id });
			}
	const people = await Promise.all(
		[...totals].map(async ([login, total]): Promise<[string, Person]> => [
			login,
			{
				login,
				user: await getGitHubUser(login),
				total,
				first: first.get(login) ?? { version: "", id: "" },
			},
		]),
	);
	return Object.fromEntries(people);
}
