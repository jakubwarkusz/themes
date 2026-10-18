import pierreDark from "@pierre/theme/pierre-dark";
import pierreLight from "@pierre/theme/pierre-light";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import type { ThemeRegistration } from "shiki";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
	dir: "content/docs",
	docs: {
		schema: pageSchema,
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
		rehypeCodeOptions: {
			themes: {
				light: pierreLight as ThemeRegistration,
				dark: pierreDark as ThemeRegistration,
			},
		},
	},
	plugins: [lastModified()],
});
