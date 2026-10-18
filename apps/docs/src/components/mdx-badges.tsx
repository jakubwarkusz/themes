import { Bug01Icon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
	neutral: "bg-fd-secondary text-fd-muted-foreground",
	success: "badge-tone [--badge-tone:var(--tone-success)]",
	warning: "badge-tone [--badge-tone:var(--tone-warning)]",
	danger: "badge-tone [--badge-tone:var(--tone-danger)]",
};

function Badge({
	tone,
	icon,
	dot,
	children,
}: {
	tone: Tone;
	icon?: IconSvgElement;
	dot?: boolean;
	children: ReactNode;
}) {
	return (
		<span
			className={cn(
				"not-prose relative -top-px inline-flex h-5 items-center gap-1 rounded-sm px-1.5 align-middle text-[11px] font-medium whitespace-nowrap",
				TONES[tone],
			)}
		>
			{dot ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
			{icon ? (
				<HugeiconsIcon icon={icon} size={11} color="currentColor" strokeWidth={2.2} />
			) : null}
			{children}
		</span>
	);
}

export function Since({ version }: { version: string }) {
	return <Badge tone="neutral">Since v{version}</Badge>;
}

export function Beta({ version }: { version: string }) {
	return (
		<Badge tone="warning" dot>
			Beta v{version}
		</Badge>
	);
}

export function Breaking({ version = "2.0.0" }: { version?: string }) {
	return (
		<Badge tone="danger" dot>
			Breaking
			<span className="opacity-70">v{version}</span>
		</Badge>
	);
}

export function Yes({ note }: { note?: string }) {
	return (
		<Badge tone="success" icon={Tick02Icon}>
			<span className="hidden sm:inline">{note ?? "Yes"}</span>
			<span className="sm:hidden">Yes</span>
		</Badge>
	);
}

export function No() {
	return (
		<Badge tone="neutral" icon={Cancel01Icon}>
			No
		</Badge>
	);
}

export function Fixed({ note }: { note?: string }) {
	return (
		<Badge tone="success" icon={Tick02Icon}>
			<span className="hidden sm:inline">{note ? `Fixed (${note})` : "Fixed"}</span>
			<span className="sm:hidden">Fixed</span>
		</Badge>
	);
}

export function Bug() {
	return (
		<Badge tone="warning" icon={Bug01Icon}>
			Bug
		</Badge>
	);
}
