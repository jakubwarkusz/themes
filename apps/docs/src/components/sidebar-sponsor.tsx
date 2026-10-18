import { HoxgerLogo } from "./hoxger-logo";

export function SidebarSponsor() {
	return (
		<a
			href="https://hoxger.com"
			target="_blank"
			rel="noreferrer"
			className="order-first flex h-7 w-fit items-center self-start rounded-md px-2 text-[11px] text-fd-muted-foreground outline-none transition-colors duration-150 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring max-md:mt-2 md:mb-1"
		>
			<span className="flex items-baseline gap-1">
				Sponsored by
				<HoxgerLogo className="h-3 w-auto translate-y-[2.45px]" />
			</span>
		</a>
	);
}
