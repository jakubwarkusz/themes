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
	return {
		type,
		target: document.documentElement,
		addedNodes: [node],
		removedNodes: [],
	} as unknown as MutationRecord;
}

function flushFrame() {
	const pending = [...frames.values()];
	frames.clear();
	for (const callback of pending) callback(0);
}

function subscribe(callback: () => void, target?: () => Element | null) {
	const unsubscribe = subscribeHistoryReapply(
		window,
		callback,
		target ?? (() => document.documentElement),
	);
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
	test("ignores unrelated class mutations without scheduling a frame", () => {
		const callback = vi.fn();
		const child = document.createElement("div");
		document.body.append(child);
		subscribe(callback);
		for (let index = 0; index < 1000; index++) {
			deliver([{ ...mutation(), target: child }]);
			flushFrame();
		}
		expect(frames.size).toBe(0);
		expect(window.requestAnimationFrame).not.toHaveBeenCalled();
		expect(callback).not.toHaveBeenCalled();
		child.remove();
	});

	test("only reapplies the affected scoped subscriber and resolves targets once per batch", () => {
		const first = document.createElement("div");
		const second = document.createElement("div");
		const firstApply = vi.fn();
		const secondApply = vi.fn();
		const firstTarget = vi.fn(() => first);
		const secondTarget = vi.fn(() => second);
		subscribe(firstApply, firstTarget);
		subscribe(secondApply, secondTarget);
		firstTarget.mockClear();
		secondTarget.mockClear();
		deliver(Array.from({ length: 1000 }, () => ({ ...mutation(), target: second })));
		flushFrame();
		expect(firstApply).not.toHaveBeenCalled();
		expect(secondApply).toHaveBeenCalledOnce();
		expect(firstTarget).toHaveBeenCalledOnce();
		expect(secondTarget).toHaveBeenCalledOnce();
	});

	test("reapplies when an unrelated mutation changes which element a selector matches", () => {
		let target: Element = document.createElement("div");
		const callback = vi.fn();
		subscribe(callback, () => target);
		target = document.createElement("section");
		deliver([{ ...mutation(), target: document.createElement("aside") }]);
		flushFrame();
		expect(callback).toHaveBeenCalledOnce();
	});

	test("keeps descendant restores, replacement targets, and late targets observable", () => {
		let target: Element | null = document.createElement("div");
		const callback = vi.fn();
		subscribe(callback, () => target);
		deliver([{ ...mutation("childList"), target }]);
		flushFrame();
		target = document.createElement("section");
		deliver([mutation("childList", target)]);
		flushFrame();
		target = null;
		deliver([mutation("childList")]);
		flushFrame();
		expect(callback).toHaveBeenCalledTimes(3);
	});

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
