import { afterEach, expect, test, vi } from "vitest";
import { getLibraryVersion } from "../lib/layout.shared";

vi.mock("next/cache", () => ({
	unstable_cache: (callback: () => Promise<unknown>) => callback,
}));

afterEach(() => vi.unstubAllGlobals());

test("shows latest even when an old beta tag still exists", async () => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ "dist-tags": { latest: "2.0.1", beta: "2.0.0-beta.3" } }),
		}),
	);
	expect(await getLibraryVersion()).toBe("2.0.1");
});

test("does not advertise beta when latest is missing", async () => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ "dist-tags": { beta: "2.0.0-beta.3" } }),
		}),
	);
	expect(await getLibraryVersion()).toBe("");
});
