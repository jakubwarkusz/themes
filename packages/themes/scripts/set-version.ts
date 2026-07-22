import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const PACKAGE_PATH = resolve(import.meta.dir, "../package.json");

export function parseVersionTag(tag: string): string {
	const match =
		/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(
			tag,
		);
	if (!match) throw new Error(`Invalid release tag: ${tag}`);

	const prerelease = match[4];
	if (
		prerelease
			?.split(".")
			.some((identifier) => /^\d+$/.test(identifier) && /^0\d+/.test(identifier))
	) {
		throw new Error(`Invalid release tag: ${tag}`);
	}
	return tag.slice(1);
}

async function main(): Promise<void> {
	const tag = process.argv[2];
	if (!tag) throw new Error("Version argument is required.");

	const content: Record<string, unknown> & { version?: unknown } = JSON.parse(
		await readFile(PACKAGE_PATH, "utf-8"),
	);
	content.version = parseVersionTag(tag);

	await writeFile(PACKAGE_PATH, `${JSON.stringify(content, null, 2)}\n`);
	console.log(`Version set to ${content.version}`);
}

if (import.meta.main) await main();
