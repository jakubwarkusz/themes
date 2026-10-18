import { afterEach, describe, expect, test } from "vitest";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { createPublishManifest, preparePackage } from "../../scripts/prepare-package.js";

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(
		temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
	);
});

describe("publication package", () => {
	test("removes development fields without changing the consumer contract", () => {
		const manifest = {
			name: "@wrksz/themes",
			version: "2.0.5-rc.1",
			type: "module",
			sideEffects: false,
			exports: {
				".": { import: { types: "./dist/index.d.ts", default: "./dist/index.js" } },
			},
			peerDependencies: {
				react: "^18.0.0 || ^19.0.0",
				typescript: ">=5.9",
				next: ">=16.0.0",
			},
			peerDependenciesMeta: { next: { optional: true } },
			license: "MIT",
			repository: { type: "git", url: "https://github.com/jakubwarkusz/themes.git" },
			scripts: { build: "tsdown" },
			devDependencies: { react: "^19.0.0" },
		};
		const published = createPublishManifest(manifest);
		expect(published).toEqual(
			Object.fromEntries(
				Object.entries(manifest).filter(
					([key]) => !["scripts", "devDependencies"].includes(key),
				),
			),
		);
		expect(manifest.scripts.build).toBe("tsdown");
		expect(manifest.devDependencies.react).toBe("^19.0.0");
	});

	test("copies artifacts and docs, removes stale output, and refreshes the release version", async () => {
		const root = await mkdtemp(resolve(tmpdir(), "themes-package-"));
		temporaryRoots.push(root);
		await mkdir(resolve(root, "dist"));
		const source = JSON.stringify({
			name: "@wrksz/themes",
			version: "2.0.5",
			scripts: { build: "tsdown" },
		});
		await writeFile(resolve(root, "package.json"), source);
		for (const path of ["README.md", "AGENTS.md", "dist/index.js", "dist/index.d.ts"]) {
			await writeFile(resolve(root, path), `content: ${path}`);
		}
		const output = await preparePackage(root);
		await writeFile(resolve(output, "stale.js"), "obsolete");
		await writeFile(resolve(root, "package.json"), source.replace("2.0.5", "2.0.6"));
		await preparePackage(root);
		for (const path of ["README.md", "AGENTS.md", "dist/index.js", "dist/index.d.ts"]) {
			expect(await readFile(resolve(output, path), "utf8")).toBe(`content: ${path}`);
		}
		expect(JSON.parse(await readFile(resolve(output, "package.json"), "utf8"))).toEqual({
			name: "@wrksz/themes",
			version: "2.0.6",
		});
		expect(await readFile(resolve(root, "package.json"), "utf8")).toBe(
			source.replace("2.0.5", "2.0.6"),
		);
		await expect(readFile(resolve(output, "stale.js"))).rejects.toThrow();
	});
});
