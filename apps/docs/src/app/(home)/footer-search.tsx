"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearchContext } from "fumadocs-ui/contexts/search";

export function FooterSearch() {
	const { setOpenSearch } = useSearchContext();

	return (
		<button
			type="button"
			onClick={() => setOpenSearch(true)}
			aria-keyshortcuts="Meta+K Control+K"
			className="-my-2 flex items-center gap-1.5 rounded-sm py-2 text-fd-muted-foreground outline-none transition-colors duration-150 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring"
		>
			<HugeiconsIcon icon={Search01Icon} size={13} color="currentColor" strokeWidth={1.8} />
			Search
		</button>
	);
}
