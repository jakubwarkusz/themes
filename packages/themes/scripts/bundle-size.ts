import { Buffer } from "node:buffer";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

export type BundleReport = {
	name: string;
	bytes: number;
	gzipBytes: number;
};

export type BundleThreshold = {
	maxBytes: number;
	maxGzipBytes: number;
};

export type BundleThresholds = Record<string, BundleThreshold>;

type BundleCase = {
	name: string;
	entry: string;
};

const rootDir = resolve(import.meta.dir, "..");
const benchmarkDir = join(rootDir, "benchmarks");
const outputDir = join(benchmarkDir, ".bundle-size");
const thresholdsPath = join(benchmarkDir, "bundle-size-thresholds.json");

const cases: BundleCase[] = [
	{ name: "use-theme", entry: "entries/use-theme.tsx" },
	{ name: "use-theme-value", entry: "entries/use-theme-value.tsx" },
	{ name: "themed-image", entry: "entries/themed-image.tsx" },
	{ name: "next-provider", entry: "entries/next-provider.tsx" },
];

const externals = ["react", "react-dom", "react/jsx-runtime", "next/headers", "next/navigation"];

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	return `${(bytes / 1024).toFixed(2)} KiB`;
}

export function compareReports(reports: BundleReport[], thresholds: BundleThresholds): string[] {
	const failures: string[] = [];

	for (const report of reports) {
		const threshold = thresholds[report.name];
		if (!threshold) {
			failures.push(`${report.name} is missing from benchmarks/bundle-size-thresholds.json`);
			continue;
		}

		if (report.bytes > threshold.maxBytes) {
			failures.push(
				`${report.name} raw size ${formatBytes(report.bytes)} exceeds budget ${formatBytes(
					threshold.maxBytes,
				)}`,
			);
		}

		if (report.gzipBytes > threshold.maxGzipBytes) {
			failures.push(
				`${report.name} gzip size ${formatBytes(report.gzipBytes)} exceeds budget ${formatBytes(
					threshold.maxGzipBytes,
				)}`,
			);
		}
	}

	return failures;
}

async function readThresholds(): Promise<BundleThresholds> {
	return JSON.parse(await readFile(thresholdsPath, "utf-8")) as BundleThresholds;
}

async function bundleCase(bundleCase: BundleCase): Promise<BundleReport> {
	const entrypoint = join(benchmarkDir, bundleCase.entry);
	const result = await Bun.build({
		entrypoints: [entrypoint],
		target: "browser",
		format: "esm",
		minify: true,
		splitting: false,
		sourcemap: "none",
		external: externals,
	});

	if (!result.success) {
		const logs = result.logs.map((log) => log.message).join("\n");
		throw new Error(`Failed to bundle ${bundleCase.name}\n${logs}`);
	}

	const output = result.outputs[0];
	if (!output) {
		throw new Error(`No output generated for ${bundleCase.name}`);
	}

	const code = await output.text();
	const bytes = Buffer.byteLength(code);
	const gzipBytes = gzipSync(code, { level: 9 }).byteLength;
	const outputPath = join(outputDir, `${bundleCase.name}.js`);

	await mkdir(outputDir, { recursive: true });
	await Bun.write(outputPath, code);

	return {
		name: bundleCase.name,
		bytes,
		gzipBytes,
	};
}

function printReport(reports: BundleReport[], thresholds: BundleThresholds): void {
	const rows = reports.map((report) => {
		const threshold = thresholds[report.name];
		return {
			case: report.name,
			raw: formatBytes(report.bytes),
			"raw budget": threshold ? formatBytes(threshold.maxBytes) : "missing",
			gzip: formatBytes(report.gzipBytes),
			"gzip budget": threshold ? formatBytes(threshold.maxGzipBytes) : "missing",
		};
	});

	console.table(rows);
	console.log(`Bundled fixtures written to ${relative(rootDir, outputDir)}`);
}

async function main(): Promise<void> {
	const json = process.argv.includes("--json");

	await rm(outputDir, { recursive: true, force: true });

	const thresholds = await readThresholds();
	const reports: BundleReport[] = [];

	for (const currentCase of cases) {
		reports.push(await bundleCase(currentCase));
	}

	if (json) {
		console.log(JSON.stringify(reports, null, 2));
	} else {
		printReport(reports, thresholds);
	}

	const failures = compareReports(reports, thresholds);
	if (failures.length > 0) {
		for (const failure of failures) {
			console.error(`Bundle size regression: ${failure}`);
		}
		process.exitCode = 1;
	}
}

if (import.meta.main) {
	await main();
}
