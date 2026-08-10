import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Beta, Breaking, Bug, Fixed, No, Since, Yes } from "./mdx-badges";

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
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
