"use client";

import { ThumbsDownIcon, ThumbsUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { track } from "@vercel/analytics";
import { useState, useSyncExternalStore } from "react";

const KEY = "wrksz-docs-feedback";

function read(page: string) {
	try {
		return localStorage.getItem(`${KEY}:${page}`);
	} catch {
		return null;
	}
}

const subscribe = () => () => {};

function Vote({
	icon,
	label,
	onClick,
}: {
	icon: IconSvgElement;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex h-7 items-center gap-1.5 rounded-md bg-fd-card px-2.5 text-xs font-medium text-fd-muted-foreground outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-fd-secondary hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]"
		>
			<HugeiconsIcon icon={icon} size={13} color="currentColor" strokeWidth={1.8} />
			{label}
		</button>
	);
}

export function PageFeedback({ page }: { page: string }) {
	const stored = useSyncExternalStore(
		subscribe,
		() => read(page),
		() => null,
	);
	const [sent, setSent] = useState<string | null>(null);
	const answer = sent ?? stored;

	const vote = (helpful: "yes" | "no") => {
		track("Docs feedback", { page, helpful });
		try {
			localStorage.setItem(`${KEY}:${page}`, helpful);
		} catch {}
		setSent(helpful);
	};

	return (
		<div className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fd-muted-foreground">
			{answer ? (
				<p className="animate-[feedback-in_200ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none">
					Thanks for the feedback.
				</p>
			) : (
				<>
					<p>Was this page helpful?</p>
					<div className="flex gap-1.5">
						<Vote icon={ThumbsUpIcon} label="Yes" onClick={() => vote("yes")} />
						<Vote icon={ThumbsDownIcon} label="No" onClick={() => vote("no")} />
					</div>
				</>
			)}
		</div>
	);
}
