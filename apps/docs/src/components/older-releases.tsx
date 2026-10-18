"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function OlderReleases({
	range,
	count,
	children,
}: {
	range: string;
	count: number;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [target, setTarget] = useState<string | null>(null);
	const id = useId();
	const root = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const reveal = (url: string) => {
			const hash = decodeURIComponent(new URL(url, location.href).hash.slice(1));
			const panel = root.current?.querySelector(`[id="${CSS.escape(id)}"]`);
			if (!hash || !panel?.contains(document.getElementById(hash))) return;
			setTarget(hash);
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
	}, [id]);

	useLayoutEffect(() => {
		if (!target) return;
		const frame = requestAnimationFrame(() => {
			document.getElementById(target)?.scrollIntoView();
			setTarget(null);
		});
		return () => cancelAnimationFrame(frame);
	}, [target]);

	return (
		<div ref={root} id="older-releases" className="scroll-m-28 border-t">
			<div className="grid gap-x-10 gap-y-3 py-8 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
				<p className="font-mono text-[15px] font-medium text-fd-muted-foreground">
					{range}
				</p>
				<button
					type="button"
					aria-expanded={open}
					aria-controls={id}
					onClick={() => setOpen(!open)}
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
				className={cn(
					"grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
					target && "transition-none",
					open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<div className="min-h-0 overflow-hidden">{children}</div>
			</div>
		</div>
	);
}
