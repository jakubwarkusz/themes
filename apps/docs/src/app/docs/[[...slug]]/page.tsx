import { findNeighbour } from "fumadocs-core/page-tree";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { TOCProvider } from "fumadocs-ui/layouts/docs/page/slots/toc";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import { PageActions } from "@/components/page-actions";
import { PageFooter } from "@/components/page-footer";
import { Toc, TocPopover } from "@/components/toc";
import { getReleases, isLegacy } from "@/lib/changelog";
import { gitConfig } from "@/lib/layout.shared";
import { getPageImage, source } from "@/lib/source";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDX = page.data.body;
	const neighbours = findNeighbour(source.getPageTree(), page.url);
	const releases = page.path === "changelog.mdx" ? await getReleases() : undefined;
	const toc = releases
		? [
				...releases
					.filter((release) => !isLegacy(release))
					.map((release) => ({
						title: release.version,
						url: `#${release.id}`,
						depth: 2,
					})),
				...(releases.some(isLegacy)
					? [{ title: "Older releases", url: "#older-releases", depth: 2 }]
					: []),
			]
		: page.data.toc;

	return (
		<DocsPage
			toc={toc}
			full={page.data.full}
			tableOfContent={{
				container: { className: "pt-8" },
			}}
			footer={{ enabled: false }}
			slots={{ toc: { provider: TOCProvider, main: Toc, popover: TocPopover } }}
		>
			<DocsTitle>{page.data.title}</DocsTitle>
			<DocsDescription className="mb-0">{page.data.description}</DocsDescription>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-6">
				<PageActions
					markdownUrl={`${page.url}.mdx`}
					pageUrl={`https://themes.wrksz.dev${page.url}`}
				/>
			</div>
			<DocsBody>
				<MDX
					components={getMDXComponents({
						a: createRelativeLink(source, page),
					})}
				/>
			</DocsBody>
			<PageFooter
				editUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
				lastModified={page.data.lastModified}
				previous={neighbours.previous}
				next={neighbours.next}
			/>
		</DocsPage>
	);
}

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/docs/[[...slug]]">): Promise<Metadata> {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	return {
		title: page.data.title,
		description: page.data.description,
		openGraph: {
			images: getPageImage(page).url,
		},
	};
}
