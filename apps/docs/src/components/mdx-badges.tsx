import { Bug01Icon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function Since({ version }: { version: string }) {
	return (
		<span className="inline-flex items-center rounded-md border border-fd-border bg-fd-muted px-1.5 py-0.5 text-xs font-medium text-fd-muted-foreground">
			Since v{version}
		</span>
	);
}

export function Beta({ version = "2.0.0-beta.1" }: { version?: string }) {
	return (
		<span className="inline-flex items-center rounded-md border border-[oklch(0.75_0.17_55/35%)] bg-[oklch(0.75_0.17_55/12%)] px-1.5 py-0.5 text-xs font-medium text-[oklch(0.62_0.15_55)]">
			v{version}
		</span>
	);
}

export function Breaking({ version = "2.0.0-beta.1" }: { version?: string }) {
	return (
		<span className="inline-flex items-center rounded-md border border-[oklch(0.65_0.22_25/35%)] bg-[oklch(0.65_0.22_25/10%)] px-1.5 py-0.5 text-xs font-medium text-[oklch(0.58_0.18_25)]">
			Breaking · v{version}
		</span>
	);
}

export function Yes({ note }: { note?: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.72_0.18_145/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.62_0.18_145)]">
			<HugeiconsIcon icon={Tick02Icon} size={11} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">{note ?? "Yes"}</span>
			<span className="sm:hidden">Yes</span>
		</span>
	);
}

export function No() {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.65_0.22_25/10%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.58_0.18_25)]">
			<HugeiconsIcon icon={Cancel01Icon} size={11} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">No</span>
		</span>
	);
}

export function Fixed({ note }: { note?: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.541_0.247_293/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.65_0.2_293)]">
			<HugeiconsIcon icon={Tick02Icon} size={11} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">{note ? `Fixed (${note})` : "Fixed"}</span>
			<span className="sm:hidden">Fixed</span>
		</span>
	);
}

export function Bug() {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.75_0.17_55/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.62_0.15_55)]">
			<HugeiconsIcon icon={Bug01Icon} size={11} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">Bug</span>
		</span>
	);
}
