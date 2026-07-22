import { Buffer } from "node:buffer";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { getScript } from "../src/core/script.js";

export type BundleReport = {
	name: string;
	bytes: number;
	gzipBytes: number;
};

export type BundleThreshold = {
	maxBytes: number;
	maxGzipBytes: number;
	maxDeltaBytes?: number;
	maxDeltaGzipBytes?: number;
};

export type BundleThresholds = Record<string, BundleThreshold>;

export type BundleComparison = BundleReport & {
	baseBytes: number | null;
	baseGzipBytes: number | null;
	deltaBytes: number | null;
	deltaGzipBytes: number | null;
	deltaPercent: number | null;
	deltaGzipPercent: number | null;
};

type BundleCase = {
	name: string;
	entry: string;
};

const rootDir = resolve(import.meta.dir, "..");
const benchmarkDir = join(rootDir, "benchmarks");
const outputDir = join(benchmarkDir, ".bundle-size");
const thresholdsPath = join(benchmarkDir, "bundle-size-thresholds.json");
const baselinePath = join(benchmarkDir, "baseline.json");

const cases: BundleCase[] = [
	{ name: "use-theme", entry: "entries/use-theme.tsx" },
	{ name: "use-theme-subpath", entry: "entries/use-theme-subpath.tsx" },
	{ name: "use-theme-value", entry: "entries/use-theme-value.tsx" },
	{ name: "use-theme-value-subpath", entry: "entries/use-theme-value-subpath.tsx" },
	{ name: "themed-image", entry: "entries/themed-image.tsx" },
	{ name: "themed-image-subpath", entry: "entries/themed-image-subpath.tsx" },
	{ name: "next-provider", entry: "entries/next-provider.tsx" },
	{ name: "script", entry: "entries/script.tsx" },
	{ name: "client-provider", entry: "entries/client-provider.tsx" },
];

export const GENERATED_SCRIPT_REPORT_NAME = "generated-script";

/**
 * Literal dynamic-import edges so dead-code analysis can see these fixtures as
 * reachable from this script (Bun.build also uses them as entrypoints).
 * Never called at runtime — only for static reachability.
 */
export function bundleEntryModuleLoaders(): ReadonlyArray<() => Promise<unknown>> {
	return [
		() => import("../benchmarks/entries/use-theme.tsx"),
		() => import("../benchmarks/entries/use-theme-subpath.tsx"),
		() => import("../benchmarks/entries/use-theme-value.tsx"),
		() => import("../benchmarks/entries/use-theme-value-subpath.tsx"),
		() => import("../benchmarks/entries/themed-image.tsx"),
		() => import("../benchmarks/entries/themed-image-subpath.tsx"),
		() => import("../benchmarks/entries/next-provider.tsx"),
		() => import("../benchmarks/entries/script.tsx"),
		() => import("../benchmarks/entries/client-provider.tsx"),
	];
}

export function bundleReportNames(): readonly string[] {
	return [...cases.map(({ name }) => name), GENERATED_SCRIPT_REPORT_NAME];
}

const externals = ["react", "react-dom", "react/jsx-runtime", "next/headers", "next/navigation"];

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	return `${(bytes / 1024).toFixed(2)} KiB`;
}

export function formatDeltaBytes(bytes: number | null): string {
	if (bytes === null) return "missing";
	if (bytes === 0) return "0 B";
	return `${bytes > 0 ? "+" : "-"}${formatBytes(Math.abs(bytes))}`;
}

export function formatPercent(value: number | null): string {
	if (value === null) return "missing";
	if (value === 0) return "0.00%";
	return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function compareWithBaseline(
	reports: BundleReport[],
	baseline: BundleReport[],
): BundleComparison[] {
	const baselineByName = new Map(baseline.map((report) => [report.name, report]));

	return reports.map((report) => {
		const base = baselineByName.get(report.name);
		const deltaBytes = base ? report.bytes - base.bytes : null;
		const deltaGzipBytes = base ? report.gzipBytes - base.gzipBytes : null;
		const deltaPercent =
			base && base.bytes > 0 ? ((report.bytes - base.bytes) / base.bytes) * 100 : null;
		const deltaGzipPercent =
			base && base.gzipBytes > 0
				? ((report.gzipBytes - base.gzipBytes) / base.gzipBytes) * 100
				: null;

		return {
			...report,
			baseBytes: base?.bytes ?? null,
			baseGzipBytes: base?.gzipBytes ?? null,
			deltaBytes,
			deltaGzipBytes,
			deltaPercent,
			deltaGzipPercent,
		};
	});
}

export function compareReports(
	reports: BundleReport[],
	thresholds: BundleThresholds,
	baseline?: BundleReport[],
): string[] {
	const failures: string[] = [];
	const comparisons = baseline ? compareWithBaseline(reports, baseline) : [];
	const comparisonByName = new Map(
		comparisons.map((comparison) => [comparison.name, comparison]),
	);

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

		const comparison = comparisonByName.get(report.name);
		if (!comparison) continue;

		if (
			threshold.maxDeltaBytes !== undefined &&
			comparison.deltaBytes !== null &&
			comparison.deltaBytes > threshold.maxDeltaBytes
		) {
			failures.push(
				`${report.name} raw delta ${formatDeltaBytes(
					comparison.deltaBytes,
				)} exceeds delta budget ${formatBytes(threshold.maxDeltaBytes)}`,
			);
		}

		if (
			threshold.maxDeltaGzipBytes !== undefined &&
			comparison.deltaGzipBytes !== null &&
			comparison.deltaGzipBytes > threshold.maxDeltaGzipBytes
		) {
			failures.push(
				`${report.name} gzip delta ${formatDeltaBytes(
					comparison.deltaGzipBytes,
				)} exceeds delta budget ${formatBytes(threshold.maxDeltaGzipBytes)}`,
			);
		}
	}

	return failures;
}

async function readThresholds(): Promise<BundleThresholds> {
	return JSON.parse(await readFile(thresholdsPath, "utf-8")) as BundleThresholds;
}

async function readBaseline(path: string): Promise<BundleReport[]> {
	return JSON.parse(await readFile(resolve(path), "utf-8")) as BundleReport[];
}

async function writeBaseline(reports: BundleReport[]): Promise<void> {
	await writeFile(baselinePath, `${JSON.stringify(reports, null, "\t")}\n`);
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

export function measureText(name: string, text: string): BundleReport {
	return {
		name,
		bytes: Buffer.byteLength(text),
		gzipBytes: gzipSync(text, { level: 9 }).byteLength,
	};
}

async function generatedScriptCase(): Promise<BundleReport> {
	const source = getScript({
		storageKey: "theme",
		attribute: ["class", "data-theme"],
		defaultTheme: "system",
		enableSystem: true,
		enableColorScheme: true,
		forcedTheme: undefined,
		themes: ["light", "dark"],
		value: { dark: "dark dark-palette" },
		target: "html",
		storage: "hybrid",
		themeColors: { light: "#fff", dark: "#000" },
		initialTheme: undefined,
		disableTransitionOnChange: true,
		followSystem: false,
		systemThemeMap: undefined,
	});
	await mkdir(outputDir, { recursive: true });
	await Bun.write(join(outputDir, `${GENERATED_SCRIPT_REPORT_NAME}.js`), source);
	return measureText(GENERATED_SCRIPT_REPORT_NAME, source);
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

function printComparison(comparisons: BundleComparison[], thresholds: BundleThresholds): void {
	const rows = comparisons.map((comparison) => {
		const threshold = thresholds[comparison.name];
		return {
			case: comparison.name,
			raw: formatBytes(comparison.bytes),
			"raw base":
				comparison.baseBytes === null ? "missing" : formatBytes(comparison.baseBytes),
			"raw delta": formatDeltaBytes(comparison.deltaBytes),
			"raw delta %": formatPercent(comparison.deltaPercent),
			"raw budget": threshold ? formatBytes(threshold.maxBytes) : "missing",
			gzip: formatBytes(comparison.gzipBytes),
			"gzip base":
				comparison.baseGzipBytes === null
					? "missing"
					: formatBytes(comparison.baseGzipBytes),
			"gzip delta": formatDeltaBytes(comparison.deltaGzipBytes),
			"gzip delta %": formatPercent(comparison.deltaGzipPercent),
			"gzip budget": threshold ? formatBytes(threshold.maxGzipBytes) : "missing",
		};
	});

	console.table(rows);
	console.log(`Bundled fixtures written to ${relative(rootDir, outputDir)}`);
}

function getArgValue(name: string): string | undefined {
	const index = process.argv.indexOf(name);
	if (index === -1) return undefined;
	return process.argv[index + 1];
}

async function main(): Promise<void> {
	const json = process.argv.includes("--json");
	const updateBaseline = process.argv.includes("--update-baseline");
	const comparePath = getArgValue("--compare");
	if (process.argv.includes("--compare") && !comparePath) {
		throw new Error("Missing baseline path after --compare");
	}

	await rm(outputDir, { recursive: true, force: true });

	const thresholds = await readThresholds();
	const baseline = comparePath ? await readBaseline(comparePath) : undefined;
	const reports: BundleReport[] = [];

	for (const currentCase of cases) {
		reports.push(await bundleCase(currentCase));
	}
	reports.push(await generatedScriptCase());

	if (updateBaseline) {
		await writeBaseline(reports);
		console.log(`Updated ${relative(rootDir, baselinePath)}`);
	}

	if (json) {
		if (baseline) {
			console.log(JSON.stringify(compareWithBaseline(reports, baseline), null, 2));
		} else {
			console.log(JSON.stringify(reports, null, 2));
		}
	} else {
		if (baseline) {
			printComparison(compareWithBaseline(reports, baseline), thresholds);
		} else {
			printReport(reports, thresholds);
		}
	}

	const failures = compareReports(reports, thresholds, baseline);
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
