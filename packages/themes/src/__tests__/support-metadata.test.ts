import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dir, "../../../..");

describe("support metadata", () => {
	test("keeps the React peer minimum aligned with public requirements", () => {
		const packageJson = JSON.parse(
			readFileSync(resolve(repositoryRoot, "packages/themes/package.json"), "utf-8"),
		) as { peerDependencies: { react: string; "react-dom": string } };
		expect(packageJson.peerDependencies.react).toBe("^19.2.0");
		expect(packageJson.peerDependencies["react-dom"]).toBe("^19.2.0");

		for (const path of [
			"README.md",
			"apps/docs/content/docs/index.mdx",
			".github/ISSUE_TEMPLATE/framework_support.yml",
		]) {
			expect(readFileSync(resolve(repositoryRoot, path), "utf-8")).toContain("React 19.2+");
		}
	});
});
