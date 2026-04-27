import { describe, expect, test } from "bun:test";
import {
	type BundleReport,
	type BundleThresholds,
	compareReports,
	formatBytes,
} from "../../scripts/bundle-size.ts";

describe("bundle-size script helpers", () => {
	test("formatBytes formats bytes and kibibytes", () => {
		expect(formatBytes(512)).toBe("512 B");
		expect(formatBytes(1536)).toBe("1.50 KiB");
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
});
