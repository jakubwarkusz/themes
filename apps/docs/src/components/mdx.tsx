import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Bug, Fixed, No, Since, Yes } from "./mdx-badges";

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

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
