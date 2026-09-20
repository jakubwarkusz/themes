import { llms } from "fumadocs-core/source";
import { source } from "@/lib/source";

export const revalidate = false;

export async function GET() {
	const index = await llms(source).index();
	return new Response(
		`${index}\n\n## Agent starting points\n\n- [Integration patterns and troubleshooting](https://themes.wrksz.dev/llms.mdx/docs/agents)\n- [Migration from next-themes and 1.x](https://themes.wrksz.dev/llms.mdx/docs/migration)\n\nThe installed package includes AGENTS.md. Check its version and declarations before applying online examples.\n`,
		{ headers: { "Content-Type": "text/plain; charset=utf-8" } },
	);
}
