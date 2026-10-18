import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";

export type ChangelogItem = {
	scope?: string;
	breaking: boolean;
	text: string;
	commit?: { hash: string; url: string };
	author?: { login: string; url: string; first: boolean };
};
export type ChangelogGroup = { name: string; items: ChangelogItem[] };
export type Release = {
	id: string;
	version: string;
	date?: string;
	url?: string;
	groups: ChangelogGroup[];
};

const PATH = join(process.cwd(), "../../CHANGELOG.md");

export const readChangelog = cache(() => readFile(PATH, "utf8"));

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const isLegacy = (release: Release) => release.version.startsWith("0.");

export const isMajor = (release: Release) => /^[1-9]\d*\.0\.0$/.test(release.version);

export const getReleases = cache(async (): Promise<Release[]> => {
	const lines = (await readChangelog()).split("\n");
	const links = new Map<string, string>();
	const releases: Release[] = [];
	let item: ChangelogItem | undefined;

	for (const line of lines) {
		const link = line.match(/^\[(.+?)\]:\s*(\S+)/);
		if (link) {
			links.set(link[1], link[2]);
			continue;
		}

		const release = line.match(/^## \[(.+?)\](?:\s*-\s*(\S+))?/);
		if (release) {
			releases.push({
				id: `v${slugify(release[1])}`,
				version: release[1],
				date: release[2],
				groups: [],
			});
			item = undefined;
			continue;
		}

		const current = releases.at(-1);
		if (!current) continue;

		const group = line.match(/^### (.+)/);
		if (group) {
			current.groups.push({ name: group[1].trim(), items: [] });
			item = undefined;
			continue;
		}

		const entry = line.match(
			/^- (?:[*_]\((.+?)\)[*_]\s+)?(\[[*_]{2}breaking[*_]{2}\]\s+)?(.+)/,
		);
		if (entry) {
			item = { scope: entry[1], breaking: Boolean(entry[2]), text: entry[3].trim() };
			current.groups.at(-1)?.items.push(item);
			continue;
		}

		if (item && /^\s+\S/.test(line)) item.text += ` ${line.trim()}`;
		else if (!line.trim()) item = undefined;
	}

	for (const release of releases) {
		release.url = links.get(release.version);
		for (const group of release.groups)
			for (const entry of group.items) {
				const commit = entry.text.match(/\s*\(\[([0-9a-f]{7,40})\]\((\S+?)\)\)$/);
				if (!commit) continue;
				entry.commit = { hash: commit[1], url: commit[2] };
				entry.text = entry.text.slice(0, commit.index).trim();
				const author = entry.text.match(/\s+by \[@([\w-]+)\]\((\S+?)\)$/);
				if (!author) continue;
				entry.author = { login: author[1], url: author[2], first: false };
				entry.text = entry.text.slice(0, author.index).trim();
			}
	}

	const seen = new Set<string>();
	for (const release of releases.toReversed())
		for (const group of release.groups)
			for (const entry of group.items) {
				if (!entry.author || seen.has(entry.author.login)) continue;
				seen.add(entry.author.login);
				entry.author.first = true;
			}
	return releases.filter((release) => release.groups.some((group) => group.items.length));
});

export async function getChangelogMarkdown() {
	const releases = await getReleases();
	return releases
		.map((release) => {
			const meta = [release.date, release.url && `[Compare](${release.url})`]
				.filter(Boolean)
				.join(" · ");
			const groups = release.groups
				.filter((group) => group.items.length)
				.map((group) =>
					[
						`### ${group.name}`,
						"",
						...group.items.map(
							(item) =>
								`- ${item.breaking ? "**Breaking:** " : ""}${item.scope ? `**${item.scope}:** ` : ""}${item.text}${item.author ? ` by [@${item.author.login}](${item.author.url})${item.author.first ? " (first contribution)" : ""}` : ""}`,
						),
					].join("\n"),
				);
			return [
				`## ${release.version}`,
				...(meta ? ["", meta] : []),
				"",
				groups.join("\n\n"),
			].join("\n");
		})
		.join("\n\n");
}
