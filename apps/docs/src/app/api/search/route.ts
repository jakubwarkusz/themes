import type { StructuredData } from "fumadocs-core/mdx-plugins";
import { createFromSource } from "fumadocs-core/search/server";
import { getReleases } from "@/lib/changelog";
import { source } from "@/lib/source";

async function changelogData(): Promise<StructuredData> {
	const releases = await getReleases();
	return {
		headings: releases.map((release) => ({ id: release.id, content: release.version })),
		contents: releases.flatMap((release) =>
			release.groups.flatMap((group) =>
				group.items.map((item) => ({
					heading: release.id,
					content: item.text.replaceAll("`", ""),
				})),
			),
		),
	};
}

export const { GET } = createFromSource(source, {
	// https://docs.orama.com/docs/orama-js/supported-languages
	language: "english",
	async buildIndex(page) {
		return {
			title: page.data.title,
			description: page.data.description,
			url: page.url,
			id: page.url,
			structuredData:
				page.path === "changelog.mdx" ? await changelogData() : page.data.structuredData,
		};
	},
});
