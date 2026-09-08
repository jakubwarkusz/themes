import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { subscribeHistoryReapply } from "../core/history-reapply.js";

const frames = new Map<number, FrameRequestCallback>();
const cleanups: Array<() => void> = [];
let sequence = 0;
let connected = false;
let deliver: (records: MutationRecord[]) => void;

function mutation(
	type: "attributes" | "childList" = "attributes",
	node: Node = document.createElement("div"),
): MutationRecord {
	return { type, addedNodes: [node], removedNodes: [] } as unknown as MutationRecord;
}

function flushFrame() {
	const pending = [...frames.values()];
	frames.clear();
	for (const callback of pending) callback(0);
}

function subscribe(callback: () => void) {
	const unsubscribe = subscribeHistoryReapply(window, callback);
	cleanups.push(unsubscribe);
	return () => {
		cleanups.splice(cleanups.indexOf(unsubscribe), 1);
		unsubscribe();
	};
}

beforeEach(() => {
	frames.clear();
	sequence = 0;
	vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
		frames.set(++sequence, callback);
		return sequence;
	});
	vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
		frames.delete(id);
	});
	vi.stubGlobal(
		"MutationObserver",
		class {
			constructor(callback: (records: MutationRecord[]) => void) {
				deliver = callback;
			}
			observe() {
				connected = true;
			}
			disconnect() {
				connected = false;
			}
		},
	);
});

afterEach(() => {
	for (const cleanup of cleanups.splice(0)) cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("history reapply lifecycle", () => {
	test("coalesces mutations and calls every active subscriber", () => {
		const first = vi.fn(),
			second = vi.fn();
		subscribe(first);
		subscribe(second);
		deliver([mutation()]);
		deliver([mutation()]);
		expect(frames.size).toBe(1);
		flushFrame();
		expect(first).toHaveBeenCalledOnce();
		expect(second).toHaveBeenCalledOnce();
	});

	test("does not call an unsubscribed first provider from a queued frame or popstate", () => {
		const first = vi.fn(),
			second = vi.fn();
		const offFirst = subscribe(first);
		subscribe(second);
		deliver([mutation()]);
		offFirst();
		flushFrame();
		window.dispatchEvent(new Event("popstate"));
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(2);
	});

	test("cancels pending work when the last provider unmounts and can subscribe again", () => {
		const first = vi.fn();
		const off = subscribe(first);
		deliver([mutation()]);
		off();
		expect(frames.size).toBe(0);
		expect(connected).toBe(false);
		const next = vi.fn();
		subscribe(next);
		deliver([mutation()]);
		flushFrame();
		expect(first).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledOnce();
	});

	test("does not observe its own writes and ignores delayed transition-style cleanup", () => {
		subscribe(() => {
			expect(connected).toBe(false);
		});
		deliver([mutation()]);
		flushFrame();
		expect(connected).toBe(true);
		deliver([mutation("childList", document.createElement("style"))]);
		expect(frames.size).toBe(0);
		deliver([mutation("childList")]);
		expect(frames.size).toBe(1);
	});
});
