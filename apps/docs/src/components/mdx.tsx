import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Children, type ComponentProps, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { Heading } from "./heading";
import { InstallCommand } from "./install-command";
import { Beta, Breaking, Bug, Fixed, No, Since, Yes } from "./mdx-badges";
import { Do, Dont } from "./practice";
import { ScrollFade } from "./scroll-fade";
import { ThemeDemo } from "./theme-demo";

function countLines(children: ReactNode) {
	const code = Children.toArray(children).find(isValidElement) as
		| { props: { children?: ReactNode } }
		| undefined;
	return Children.toArray(code?.props.children).filter(
		(line) =>
			isValidElement<{ className?: string }>(line) && line.props.className?.includes("line"),
	).length;
}

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		Callout,
		InstallCommand,
		h2: (props) => <Heading as="h2" {...props} />,
		h3: (props) => <Heading as="h3" {...props} />,
		h4: (props) => <Heading as="h4" {...props} />,
		h5: (props) => <Heading as="h5" {...props} />,
		h6: (props) => <Heading as="h6" {...props} />,
		ThemeDemo,
		pre: ({
			ref: _ref,
			title,
			icon: _icon,
			className,
			...props
		}: ComponentProps<"pre"> & { icon?: unknown }) => (
			<CodeBlock title={title} lines={countLines(props.children)}>
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
