import { findNeighbour } from "fumadocs-core/page-tree";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import type { ComponentProps, ComponentType } from "react";
import { notFound } from "next/navigation";
import { ApiPagesProvider, AutoCode, LinkScope } from "@/components/api-code";
import { getMDXComponents } from "@/components/mdx";
import { OlderReleasesProvider } from "@/components/older-releases";
import { PageActions } from "@/components/page-actions";
import { PageFooter } from "@/components/page-footer";
import { Toc, TocPopover, TocProvider } from "@/components/toc";
import { getReleases, isLegacy, type Release } from "@/lib/changelog";
import { gitConfig } from "@/lib/layout.shared";
import { getPageImage, source } from "@/lib/source";

function scopedLink(Link: ComponentType<ComponentProps<"a">>) {
	return function ScopedLink(props: ComponentProps<"a">) {
		return (
			<LinkScope>
				<Link {...props} />
			</LinkScope>
		);
	};
}

const toTocItem = (release: Release) => ({
	title: release.version,
	url: `#${release.id}`,
	depth: 2,
});

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDX = page.data.body;
	const apiPages = Object.fromEntries(
		source
			.getPages()
			.filter((api) => api.url.startsWith("/docs/api/") && api.url !== page.url)
			.map((api) => [
				api.data.title,
				{ url: api.url, title: api.data.title, description: api.data.description },
			]),
	);
	const neighbours = findNeighbour(source.getPageTree(), page.url);
	const releases = page.path === "changelog.mdx" ? await getReleases() : undefined;
	const legacyToc = releases?.filter(isLegacy).map(toTocItem) ?? [];
	const toc = releases
		? [
				...releases.filter((release) => !isLegacy(release)).map(toTocItem),
				...(legacyToc.length
					? [{ title: "Older releases", url: "#older-releases", depth: 2 }]
					: []),
			]
		: page.data.toc;

	const content = (
		<DocsPage
			toc={toc}
			full={page.data.full}
			tableOfContent={{
				container: { className: "pt-8" },
			}}
			footer={{ enabled: false }}
			slots={{ toc: { provider: TocProvider, main: Toc, popover: TocPopover } }}
		>
			<DocsTitle>{page.data.title}</DocsTitle>
			<DocsDescription className="mb-0">{page.data.description}</DocsDescription>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-6">
				{page.data.actions === false ? null : (
					<PageActions
						markdownUrl={`${page.url}.mdx`}
						pageUrl={`https://themes.wrksz.dev${page.url}`}
					/>
				)}
			</div>
			<DocsBody>
				<ApiPagesProvider pages={apiPages}>
					<MDX
						components={getMDXComponents({
							a: scopedLink(createRelativeLink(source, page)),
							code: AutoCode,
						})}
					/>
				</ApiPagesProvider>
			</DocsBody>
			<PageFooter
				page={page.url}
				editUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/${page.path}`}
				lastModified={page.data.lastModified}
				previous={neighbours.previous}
				next={neighbours.next}
			/>
		</DocsPage>
	);

	return legacyToc.length ? (
		<OlderReleasesProvider toc={legacyToc}>{content}</OlderReleasesProvider>
	) : (
		content
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
