import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";

export type ChangelogItem = { scope?: string; breaking: boolean; text: string };
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
				id: `v${release[1].toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
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

		const entry = line.match(/^- (?:\*\((.+?)\)\*\s+)?(\[\*\*breaking\*\*\]\s+)?(.+)/);
		if (entry) {
			item = { scope: entry[1], breaking: Boolean(entry[2]), text: entry[3].trim() };
			current.groups.at(-1)?.items.push(item);
			continue;
		}

		if (item && /^\s+\S/.test(line)) item.text += ` ${line.trim()}`;
		else if (!line.trim()) item = undefined;
	}

	for (const release of releases) release.url = links.get(release.version);
	return releases.filter((release) => release.groups.some((group) => group.items.length));
});
