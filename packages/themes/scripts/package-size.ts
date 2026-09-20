import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const { maxUnpackedBytes } = JSON.parse(
	await readFile(resolve(root, "benchmarks/package-size-thresholds.json"), "utf8"),
) as { maxUnpackedBytes: number };
assert.ok(Number.isSafeInteger(maxUnpackedBytes) && maxUnpackedBytes > 0);

const reports = JSON.parse(
	execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
		cwd: root,
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
for (const entry of Object.values(manifest.exports)) {
	for (const path of typeof entry === "string" ? [entry] : Object.values(entry.import)) {
		assert.ok(paths.has(path), `Published export missing: ${path}. Run pnpm build first.`);
	}
}

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
