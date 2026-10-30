"use client";

import { Popover, PopoverContent, PopoverTrigger } from "fumadocs-ui/components/ui/popover";
import Link from "next/link";
import { type PointerEvent, type ReactNode, useRef, useState } from "react";

const OPEN_DELAY = 300;
const CLOSE_DELAY = 150;

export const PREVIEW_CARD =
	"flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-xl border-0 bg-fd-popover p-3 shadow-[0_10px_24px_rgb(0_0_0/0.09),0_2px_8px_rgb(0_0_0/0.06),0_0_0_1px_var(--color-fd-border)] backdrop-blur-none";

export function HoverPreview({
	href,
	className,
	content,
	canOpen,
	children,
}: {
	href: string;
	className?: string;
	content: ReactNode;
	canOpen?: () => boolean;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	function schedule(next: boolean) {
		clearTimeout(timer.current);
		timer.current = setTimeout(
			() => {
				if (next && canOpen && !canOpen()) return;
				setOpen(next);
			},
			next ? OPEN_DELAY : CLOSE_DELAY,
		);
	}

	const hover = {
		onPointerEnter: (event: PointerEvent) => {
			if (event.pointerType === "mouse") schedule(true);
		},
		onPointerLeave: (event: PointerEvent) => {
			if (event.pointerType === "mouse") schedule(false);
		},
	};

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (!next) setOpen(false);
			}}
		>
			<PopoverTrigger asChild>
				<Link
					href={href}
					{...hover}
					onFocus={() => schedule(true)}
					onBlur={() => schedule(false)}
					className={className}
				>
					{children}
				</Link>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={6}
				onOpenAutoFocus={(event: Event) => event.preventDefault()}
				onCloseAutoFocus={(event: Event) => event.preventDefault()}
				{...hover}
				className={PREVIEW_CARD}
			>
				{content}
			</PopoverContent>
		</Popover>
	);
}
