import { afterEach, beforeEach, test, vi } from "vitest";
import { applyThemeToDom } from "../src/core/client-dom.js";
import { subscribeHistoryReapply } from "../src/core/history-reapply.js";

const frames = new Map<number, FrameRequestCallback>();
let sequence = 0;
let target: HTMLDivElement;
let deliver: (records: MutationRecord[]) => void;

const options = {
	resolved: "dark",
	attribute: "class" as const,
	themes: ["light", "dark"],
	valueMap: { dark: "dark palette-dark", light: "light palette-light" },
	target: "#runtime-benchmark",
	disableTransitionOnChange: false,
	enableColorScheme: true,
	themeColor: undefined,
};

function flushFrame(): void {
	const pending = [...frames.values()];
	frames.clear();
	for (const callback of pending) callback(0);
}

beforeEach(() => {
	sequence = 0;
	target = document.createElement("div");
	target.id = "runtime-benchmark";
	document.body.append(target);
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
		frames.set(++sequence, callback);
		return sequence;
	});
	vi.stubGlobal("cancelAnimationFrame", (frame: number) => frames.delete(frame));
	vi.stubGlobal(
		"MutationObserver",
		class {
			constructor(callback: (records: MutationRecord[]) => void) {
				deliver = callback;
			}
			observe() {}
			disconnect() {}
		},
	);
});

afterEach(() => {
	flushFrame();
	flushFrame();
	target.remove();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

test("stable DOM application", async ({ bench }) => {
	applyThemeToDom(options);
	await bench("1000 unchanged applies", () => {
		for (let index = 0; index < 1000; index++) applyThemeToDom(options);
	}).run();
});

test("unrelated class mutations", async ({ bench }) => {
	const stop = subscribeHistoryReapply(
		window,
		() => applyThemeToDom({ ...options, target: "html" }),
		() => document.documentElement,
	);
	const records = [
		{ type: "attributes", attributeName: "class", target },
	] as unknown as MutationRecord[];
	try {
		await bench("1000 unrelated mutation batches and frames", () => {
			for (let index = 0; index < 1000; index++) {
				deliver(records);
				flushFrame();
			}
		}).run();
	} finally {
		stop();
	}
});

test("unrelated child-list mutations with scoped providers", async ({ bench }) => {
	const scopes = Array.from({ length: 8 }, () => document.createElement("section"));
	document.body.append(...scopes);
	const stops = scopes.map((scope) =>
		subscribeHistoryReapply(
			window,
			() => {},
			() => scope,
		),
	);
	const addedNodes = Array.from({ length: 16 }, () => document.createElement("div"));
	const removedNodes = Array.from({ length: 16 }, () => document.createElement("div"));
	const records = Array.from({ length: 1000 }, () => ({
		type: "childList",
		attributeName: null,
		target,
		addedNodes,
		removedNodes,
	})) as unknown as MutationRecord[];
	try {
		await bench("1000 unrelated child-list records across 8 scopes", () => {
			deliver(records);
		}).run();
	} finally {
		for (const stop of stops) stop();
		for (const scope of scopes) scope.remove();
	}
});

test("rapid transitions", async ({ bench }) => {
	await bench("1000 theme changes in one frame", () => {
		for (let index = 0; index < 1000; index++) {
			applyThemeToDom({
				...options,
				resolved: index % 2 ? "dark" : "light",
				disableTransitionOnChange: true,
			});
		}
		flushFrame();
		flushFrame();
	}).run();
});
