import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Callout } from "./callout";
import { Beta, Breaking, Bug, Fixed, No, Since, Yes } from "./mdx-badges";
import { Do, Dont } from "./practice";
import { ScrollFade } from "./scroll-fade";

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		Callout,
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
