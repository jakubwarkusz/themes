import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { InstallCommand } from "./install-command";
import { Beta, Breaking, Bug, Fixed, No, Since, Yes } from "./mdx-badges";
import { Do, Dont } from "./practice";
import { ScrollFade } from "./scroll-fade";

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		Callout,
		InstallCommand,
		pre: ({
			ref: _ref,
			title,
			icon: _icon,
			className,
			...props
		}: ComponentProps<"pre"> & { icon?: unknown }) => (
			<CodeBlock title={title}>
				<pre
					className={cn(
						className,
						"w-max min-w-full py-3.5 text-[0.875rem] leading-relaxed outline-none *:flex *:flex-col",
					)}
					{...props}
				/>
			</CodeBlock>
		),
		Do,
		Dont,
		table: (props) => (
			<ScrollFade className="prose-no-margin my-6 overflow-x-auto">
				<table {...props} />
			</ScrollFade>
		),
		Tab,
		Tabs,
		Since,
		Beta,
		Breaking,
		Yes,
		No,
		Fixed,
		Bug,
		...components,
	} satisfies MDXComponents;
}

/** Required by fumadocs-mdx when evaluating MDX outside page renders (search, processed markdown). */
export const useMDXComponents = getMDXComponents;

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
