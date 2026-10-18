"use client";

import { useFetchSearch } from "fumadocs-core/search/client/fetch";
import {
	SearchDialog,
	SearchDialogClose,
	SearchDialogContent,
	SearchDialogHeader,
	SearchDialogIcon,
	SearchDialogInput,
	SearchDialogList,
	SearchDialogListItem,
	SearchDialogOverlay,
} from "fumadocs-ui/components/dialog/search";
import type { SharedProps } from "fumadocs-ui/contexts/search";
import type { ComponentProps } from "react";
import { scrollFade } from "./scroll-fade";

type ItemProps = Parameters<NonNullable<ComponentProps<typeof SearchDialogList>["Item"]>>[0];

function SearchItem({ item, table, onClick }: ItemProps) {
	return (
		<SearchDialogListItem
			item={item}
			table={table}
			onClick={onClick}
			className="search-item"
			data-kind={item.type}
		/>
	);
}

function trackFade(content: HTMLDivElement | null) {
	return scrollFade(content?.querySelector<HTMLElement>("#fd-search-list") ?? null);
}

function SearchEmpty() {
	return <p className="search-empty">Nothing matches that.</p>;
}

export default function DocsSearchDialog(props: SharedProps) {
	const search = useFetchSearch({ api: "/api/search" });

	return (
		<SearchDialog {...search} {...props}>
			<SearchDialogOverlay className="search-overlay" />
			<SearchDialogContent ref={trackFade} className="search-dialog">
				<SearchDialogHeader className="search-header">
					<SearchDialogIcon className="search-lens" />
					<SearchDialogInput className="search-input" placeholder="Search the docs" />
					<SearchDialogClose className="search-close">
						<kbd>Esc</kbd>
					</SearchDialogClose>
				</SearchDialogHeader>
				<SearchDialogList className="search-list" Item={SearchItem} Empty={SearchEmpty} />
			</SearchDialogContent>
		</SearchDialog>
	);
}
