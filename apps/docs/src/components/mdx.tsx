import { Bug01Icon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

function Since({ version }: { version: string }) {
	return (
		<span className="inline-flex items-center rounded-md border border-fd-border bg-fd-muted px-1.5 py-0.5 text-xs font-medium text-fd-muted-foreground">
			Since v{version}
		</span>
	);
}

function Yes({ note }: { note?: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.72_0.18_145/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.62_0.18_145)]">
			<HugeiconsIcon icon={Tick02Icon} size={11} color="currentColor" strokeWidth={2} />
			{note ?? "Yes"}
		</span>
	);
}

function No() {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.65_0.22_25/10%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.58_0.18_25)]">
			<HugeiconsIcon icon={Cancel01Icon} size={11} color="currentColor" strokeWidth={2} />
			No
		</span>
	);
}

function Fixed({ note }: { note?: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.541_0.247_293/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.65_0.2_293)]">
			<HugeiconsIcon icon={Tick02Icon} size={11} color="currentColor" strokeWidth={2} />
			{note ? `Fixed (${note})` : "Fixed"}
		</span>
	);
}

function Bug() {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.75_0.17_55/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.62_0.15_55)]">
			<HugeiconsIcon icon={Bug01Icon} size={11} color="currentColor" strokeWidth={2} />
			Bug
		</span>
	);
}

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		Tab,
		Tabs,
		Since,
		Yes,
		No,
		Fixed,
		Bug,
		...components,
	} satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
