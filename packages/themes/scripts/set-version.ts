import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const PACKAGE_PATH = resolve(import.meta.dir, "../package.json");

const version = process.argv[2];

if (!version) {
	throw new Error("Version argument is required.");
}

const content: Record<string, unknown> = JSON.parse(await readFile(PACKAGE_PATH, "utf-8"));
content.version = version.replace(/^v/, "");

await writeFile(PACKAGE_PATH, `${JSON.stringify(content, null, 2)}\n`);

console.log(`Version set to ${content.version}`);
