import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import { codeThemes } from "./src/lib/code-themes";
import { remarkLLMsComponents } from "./src/lib/remark-llms-components";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
	dir: "content/docs",
	docs: {
		schema: pageSchema.extend({ actions: pageSchema.shape.full }),
		postprocess: {
			includeProcessedMarkdown: true,
		},
	},
	meta: {
		schema: metaSchema,
	},
});

export default defineConfig({
	mdxOptions: {
		providerImportSource: "@/components/mdx",
		remarkPlugins: (plugins) => [...plugins, remarkLLMsComponents],
		rehypeCodeOptions: {
			themes: codeThemes,
		},
	},
	plugins: [lastModified()],
});
