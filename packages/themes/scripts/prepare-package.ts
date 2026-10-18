import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export function createPublishManifest(manifest: Record<string, unknown>): Record<string, unknown> {
	const { scripts: _scripts, devDependencies: _devDependencies, ...published } = manifest;
	return published;
}

export async function preparePackage(root: string): Promise<string> {
	const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as Record<
		string,
		unknown
	>;
	const output = resolve(root, ".publish");
	await rm(output, { recursive: true, force: true });
	await mkdir(output, { recursive: true });
	for (const path of ["dist", "README.md", "AGENTS.md"]) {
		await cp(resolve(root, path), resolve(output, path), { recursive: true });
	}
	await writeFile(
		resolve(output, "package.json"),
		`${JSON.stringify(createPublishManifest(manifest), null, 2)}\n`,
	);
	return output;
}

if (import.meta.main) await preparePackage(resolve(import.meta.dirname, ".."));
