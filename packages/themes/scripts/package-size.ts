import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { preparePackage } from "./prepare-package.js";
import { preProcessFile } from "typescript";

const root = resolve(import.meta.dirname, "..");
const { maxUnpackedBytes } = JSON.parse(
	await readFile(resolve(root, "benchmarks/package-size-thresholds.json"), "utf8"),
) as { maxUnpackedBytes: number };
assert.ok(Number.isSafeInteger(maxUnpackedBytes) && maxUnpackedBytes > 0);
const publishRoot = await preparePackage(root);

const reports = JSON.parse(
	execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
		cwd: publishRoot,
		encoding: "utf8",
	}),
) as Array<{
	name: string;
	size: number;
	unpackedSize: number;
	files: Array<{ path: string; size: number }>;
}>;
assert.equal(reports.length, 1);
const report = reports[0]!;
assert.equal(report.name, "@wrksz/themes");
assert.ok(Number.isSafeInteger(report.unpackedSize) && report.unpackedSize > 0);
assert.equal(
	report.files.reduce((total, file) => total + file.size, 0),
	report.unpackedSize,
);

const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as {
	exports: Record<string, string | { import: { types: string; default: string } }>;
};
const paths = new Set(report.files.map((file) => `./${file.path}`));
assert.ok(paths.has("./AGENTS.md"), "Consumer agent guidance missing from the npm package.");
for (const entry of Object.values(manifest.exports)) {
	for (const path of typeof entry === "string" ? [entry] : Object.values(entry.import)) {
		assert.ok(paths.has(path), `Published export missing: ${path}. Run pnpm build first.`);
	}
}

for (const file of report.files) {
	if (!file.path.endsWith(".d.ts")) continue;
	const path = resolve(publishRoot, file.path);
	const source = await readFile(path, "utf8");
	for (const imported of preProcessFile(source).importedFiles) {
		if (!imported.fileName.startsWith(".")) continue;
		await readFile(resolve(path, "..", imported.fileName.replace(/\.js$/, ".d.ts")));
	}
}

const importChecks = Object.keys(manifest.exports)
	.filter((subpath) => subpath !== "./package.json")
	.map((subpath) => {
		const specifier = `@wrksz/themes${subpath === "." ? "" : subpath.slice(1)}`;
		return `import ${JSON.stringify(specifier)}; if (!import.meta.resolve(${JSON.stringify(specifier)}).includes('/.publish/dist/')) throw new Error('Unexpected package resolution');`;
	});
execFileSync(process.execPath, ["--input-type=module", "-e", importChecks.join("\n")], {
	cwd: publishRoot,
	stdio: "inherit",
});

console.table({
	package: {
		unpackedBytes: report.unpackedSize,
		maxUnpackedBytes,
		tarballBytes: report.size,
		files: report.files.length,
	},
});
assert.ok(
	report.unpackedSize <= maxUnpackedBytes,
	`Package size ${report.unpackedSize} B exceeds ${maxUnpackedBytes} B. Review packed files before changing the budget.`,
);
