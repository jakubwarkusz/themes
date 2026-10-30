import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { registryItems } from "@/registry/registry";

export const dynamicParams = false;

export function generateStaticParams() {
	return registryItems.map((item) => ({ name: `${item.name}.json` }));
}

export async function GET(_request: Request, { params }: RouteContext<"/r/[name]">) {
	const { name } = await params;
	const item = registryItems.find((entry) => `${entry.name}.json` === name);
	if (!item) return new Response("Not found", { status: 404 });

	const content = await readFile(join(process.cwd(), "src/registry", `${item.name}.tsx`), "utf8");

	return Response.json({
		$schema: "https://ui.shadcn.com/schema/registry-item.json",
		name: item.name,
		type: "registry:component",
		title: item.title,
		description: item.description,
		dependencies: item.dependencies,
		...(item.registryDependencies.length
			? { registryDependencies: item.registryDependencies }
			: {}),
		files: [
			{
				path: `components/${item.name}.tsx`,
				type: "registry:component",
				content,
			},
		],
	});
}
