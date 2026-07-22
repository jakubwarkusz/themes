import { describe, expect, test } from "bun:test";
import { parseVersionTag } from "../../scripts/set-version.js";

describe("parseVersionTag", () => {
	test("accepts stable and dot-separated prerelease tags", () => {
		expect(parseVersionTag("v1.2.3")).toBe("1.2.3");
		expect(parseVersionTag("v1.2.3-rc.1")).toBe("1.2.3-rc.1");
	});

	test("rejects malformed release tags", () => {
		for (const tag of ["1.2.3", "v1.2", "v01.2.3", "v1.2.3-", "v1.2.3-rc..1"]) {
			expect(() => parseVersionTag(tag)).toThrow("Invalid release tag");
		}
	});
});
