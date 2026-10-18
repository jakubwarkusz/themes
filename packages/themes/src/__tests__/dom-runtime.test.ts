import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { disableTransitions, splitClassTokens } from "../core/dom-runtime.js";

const frames = new Map<number, FrameRequestCallback>();
let sequence = 0;

function flushFrame(): void {
	const pending = [...frames.values()];
	frames.clear();
	for (const callback of pending) callback(0);
}

beforeEach(() => {
	sequence = 0;
	vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
		frames.set(++sequence, callback);
		return sequence;
	});
	vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frame) => {
		frames.delete(frame);
	});
});

afterEach(() => {
	flushFrame();
	flushFrame();
	vi.restoreAllMocks();
});

test("reuses token arrays across targets and bounds the cache", () => {
	const tokens = splitClassTokens("dark  palette-dark ");
	expect(tokens).toEqual(["dark", "palette-dark"]);
	for (let index = 0; index < 1000; index++) {
		expect(splitClassTokens("dark  palette-dark ")).toBe(tokens);
	}
	for (let index = 0; index < 33; index++) splitClassTokens(`theme-${index}`);
	expect(splitClassTokens("dark  palette-dark ")).not.toBe(tokens);
	expect(splitClassTokens("")).toEqual([]);
});

test("shares a transition style and extends protection from the latest change", () => {
	const root = document.createElement("div");
	const mutations = new MutationObserver(() => {});
	mutations.observe(root, { childList: true });
	try {
		for (let index = 0; index < 1000; index++) disableTransitions(true, root);
		expect(root.childNodes).toHaveLength(1);
		expect(mutations.takeRecords()).toHaveLength(1);
		expect(frames.size).toBe(1);
		expect(window.requestAnimationFrame).toHaveBeenCalledOnce();
		flushFrame();
		disableTransitions(true, root);
		flushFrame();
		expect(root.childNodes).toHaveLength(1);
		flushFrame();
		expect(root.childNodes).toHaveLength(0);
		expect(frames.size).toBe(0);
	} finally {
		mutations.disconnect();
	}
});

test("keeps distinct values and roots independent and preserves the latest CSS precedence", () => {
	const root = document.createElement("div");
	const shadow = document.createElement("div").attachShadow({ mode: "open" });
	disableTransitions(true, root);
	disableTransitions("color 0s", root);
	disableTransitions(true, shadow);
	expect(root.childNodes).toHaveLength(2);
	expect(shadow.childNodes).toHaveLength(1);
	disableTransitions(true, root);
	expect(root.lastChild?.textContent).toContain("transition:none!");
	expect(frames.size).toBe(3);
	flushFrame();
	expect(root.childNodes).toHaveLength(2);
	flushFrame();
	expect(root.childNodes).toHaveLength(0);
	expect(shadow.childNodes).toHaveLength(0);
});

test("reattaches a transition style removed externally", () => {
	const root = document.createElement("div");
	disableTransitions(true, root);
	const style = root.firstChild;
	root.replaceChildren();
	disableTransitions(true, root);
	expect(root.firstChild).toBe(style);
	flushFrame();
	flushFrame();
	expect(root.childNodes).toHaveLength(0);
});
