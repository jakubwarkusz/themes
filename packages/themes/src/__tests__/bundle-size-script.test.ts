import { describe, expect, test } from "bun:test";
import {
	type BundleReport,
	type BundleThresholds,
	bundleEntryModuleLoaders,
	compareReports,
	compareWithBaseline,
	formatBytes,
	formatDeltaBytes,
	formatPercent,
} from "../../scripts/bundle-size.ts";

describe("bundle-size script helpers", () => {
	test("keeps every benchmark fixture statically reachable", () => {
		expect(bundleEntryModuleLoaders()).toHaveLength(10);
	});

	test("formatBytes formats bytes and kibibytes", () => {
		expect(formatBytes(512)).toBe("512 B");
		expect(formatBytes(1536)).toBe("1.50 KiB");
	});

	test("formats bundle deltas", () => {
		expect(formatDeltaBytes(0)).toBe("0 B");
		expect(formatDeltaBytes(128)).toBe("+128 B");
		expect(formatDeltaBytes(-1536)).toBe("-1.50 KiB");
		expect(formatDeltaBytes(null)).toBe("missing");
		expect(formatPercent(2.345)).toBe("+2.35%");
		expect(formatPercent(-1.2)).toBe("-1.20%");
		expect(formatPercent(null)).toBe("missing");
	});

	test("compareWithBaseline returns raw and gzip deltas", () => {
		const reports: BundleReport[] = [{ name: "use-theme", bytes: 1100, gzipBytes: 550 }];
		const baseline: BundleReport[] = [{ name: "use-theme", bytes: 1000, gzipBytes: 500 }];

		expect(compareWithBaseline(reports, baseline)).toEqual([
			{
				name: "use-theme",
				bytes: 1100,
				gzipBytes: 550,
				baseBytes: 1000,
				baseGzipBytes: 500,
				deltaBytes: 100,
				deltaGzipBytes: 50,
				deltaPercent: 10,
				deltaGzipPercent: 10,
			},
		]);
	});

	test("compareReports returns no failures when reports fit thresholds", () => {
		const reports: BundleReport[] = [
			{ name: "use-theme", bytes: 1000, gzipBytes: 500 },
			{ name: "themed-image", bytes: 3000, gzipBytes: 1200 },
		];
		const thresholds: BundleThresholds = {
			"use-theme": { maxBytes: 1200, maxGzipBytes: 600 },
			"themed-image": { maxBytes: 3500, maxGzipBytes: 1500 },
		};

		expect(compareReports(reports, thresholds)).toEqual([]);
	});

	test("compareReports reports raw and gzip threshold failures", () => {
		const reports: BundleReport[] = [{ name: "next-provider", bytes: 21000, gzipBytes: 7100 }];
		const thresholds: BundleThresholds = {
			"next-provider": { maxBytes: 20000, maxGzipBytes: 7000 },
		};

		expect(compareReports(reports, thresholds)).toEqual([
			"next-provider raw size 20.51 KiB exceeds budget 19.53 KiB",
			"next-provider gzip size 6.93 KiB exceeds budget 6.84 KiB",
		]);
	});

	test("compareReports reports missing thresholds", () => {
		const reports: BundleReport[] = [{ name: "use-theme-value", bytes: 1000, gzipBytes: 500 }];

		expect(compareReports(reports, {})).toEqual([
			"use-theme-value is missing from benchmarks/bundle-size-thresholds.json",
		]);
	});

	test("compareReports reports delta budget failures when baseline is provided", () => {
		const reports: BundleReport[] = [{ name: "next-provider", bytes: 9600, gzipBytes: 3600 }];
		const baseline: BundleReport[] = [{ name: "next-provider", bytes: 9000, gzipBytes: 3300 }];
		const thresholds: BundleThresholds = {
			"next-provider": {
				maxBytes: 10000,
				maxGzipBytes: 4000,
				maxDeltaBytes: 500,
				maxDeltaGzipBytes: 250,
			},
		};

		expect(compareReports(reports, thresholds, baseline)).toEqual([
			"next-provider raw delta +600 B exceeds delta budget 500 B",
			"next-provider gzip delta +300 B exceeds delta budget 250 B",
		]);
	});
});
