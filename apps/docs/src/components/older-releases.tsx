"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { TOCItemType } from "fumadocs-core/toc";
import {
	createContext,
	type ReactNode,
	use,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/cn";

export const OlderReleasesContext = createContext<{
	open: boolean;
	setOpen: (open: boolean) => void;
	toc: TOCItemType[];
} | null>(null);

export function OlderReleasesProvider({
	toc,
	children,
}: {
	toc: TOCItemType[];
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return <OlderReleasesContext value={{ open, setOpen, toc }}>{children}</OlderReleasesContext>;
}

export function OlderReleases({
	range,
	count,
	children,
}: {
	range: string;
	count: number;
	children: ReactNode;
}) {
	const shared = use(OlderReleasesContext);
	const [local, setLocal] = useState(false);
	const open = shared?.open ?? local;
	const setOpen = shared?.setOpen ?? setLocal;
	const [settled, setSettled] = useState(false);
	const [target, setTarget] = useState<string | null>(null);
	const id = useId();
	const root = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const reveal = (url: string) => {
			const hash = decodeURIComponent(new URL(url, location.href).hash.slice(1));
			const panel = root.current?.querySelector(`[id="${CSS.escape(id)}"]`);
			if (!hash || !panel?.contains(document.getElementById(hash))) return;
			setTarget(hash);
			setSettled(true);
			setOpen(true);
		};
		const onNavigate = (event: Event) => {
			const { url } = (event as Event & { destination: { url: string } }).destination;
			queueMicrotask(() => reveal(url));
		};
		const onHash = () => reveal(location.href);
		const navigation = (window as Window & { navigation?: EventTarget }).navigation;

		reveal(location.href);
		navigation?.addEventListener("navigate", onNavigate);
		window.addEventListener("hashchange", onHash);
		return () => {
			navigation?.removeEventListener("navigate", onNavigate);
			window.removeEventListener("hashchange", onHash);
		};
	}, [id, setOpen]);

	useLayoutEffect(() => {
		if (!target) return;
		const frame = requestAnimationFrame(() => {
			document.getElementById(target)?.scrollIntoView();
			setTarget(null);
		});
		return () => cancelAnimationFrame(frame);
	}, [target]);

	return (
		<div ref={root} id="older-releases" className="min-w-0 scroll-m-28 border-t">
			<div className="grid gap-x-10 gap-y-3 py-8 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
				<p className="font-mono text-[15px] font-medium text-fd-muted-foreground">
					{range}
				</p>
				<button
					type="button"
					aria-expanded={open}
					aria-controls={id}
					onClick={() => {
						setSettled(
							!open && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
						);
						setOpen(!open);
					}}
					className="flex h-8 w-fit items-center gap-1.5 rounded-md bg-fd-card px-3 text-sm font-medium text-fd-muted-foreground outline-none transition-[color,scale] duration-150 ease-out hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]"
				>
					{open ? "Hide older releases" : `Show ${count} older releases`}
					<HugeiconsIcon
						icon={ArrowDown01Icon}
						size={12}
						color="currentColor"
						strokeWidth={2}
						className={cn(
							"transition-transform duration-200 ease-out motion-reduce:transition-none",
							open && "rotate-180",
						)}
					/>
				</button>
			</div>
			<div
				id={id}
				inert={!open}
				onTransitionEnd={(event) => {
					if (event.target === event.currentTarget && open) setSettled(true);
				}}
				className={cn(
					"grid min-w-0 transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
					target && "transition-none",
					open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<div className={cn("min-h-0 min-w-0", !settled && "overflow-clip")}>{children}</div>
			</div>
		</div>
	);
}
