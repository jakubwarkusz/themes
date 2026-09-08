import { afterEach, describe, expect, test } from "bun:test";
import { subscribeHistoryReapply } from "../core/history-reapply.js";

const unsubscribers: Array<() => void> = [];

function subscribe(apply: () => void): () => void {
	const view = document.defaultView;
	if (!view) throw new Error("expected document.defaultView");
	const unsubscribe = subscribeHistoryReapply(view, apply);
	unsubscribers.push(unsubscribe);
	return unsubscribe;
}

function frame(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => resolve());
	});
}

async function waitForObserver(): Promise<void> {
	await Promise.resolve();
	await frame();
	await frame();
}

afterEach(() => {
	for (const unsubscribe of unsubscribers.splice(0)) unsubscribe();
});

describe("subscribeHistoryReapply", () => {
	test("observer invokes every subscriber", async () => {
		const first: string[] = [];
		const second: string[] = [];
		subscribe(() => first.push("apply"));
		subscribe(() => second.push("apply"));

		document.documentElement.className = "theme-probe";
		await waitForObserver();

		expect(first).toEqual(["apply"]);
		expect(second).toEqual(["apply"]);
	});

	test("every subscriber receives popstate", () => {
		const first: string[] = [];
		const second: string[] = [];
		subscribe(() => first.push("pop"));
		subscribe(() => second.push("pop"));

		window.dispatchEvent(new window.Event("popstate"));

		expect(first).toEqual(["pop"]);
		expect(second).toEqual(["pop"]);
	});

	test("unsubscribing the first subscriber keeps the observer for remaining ones", async () => {
		const first: string[] = [];
		const second: string[] = [];
		const unsubFirst = subscribe(() => first.push("apply"));
		subscribe(() => second.push("apply"));

		unsubFirst();
		unsubscribers.shift();

		document.documentElement.className = "keep-second";
		await waitForObserver();

		expect(first).toEqual([]);
		expect(second.length).toBeGreaterThan(0);
	});

	test("unsubscribing a later subscriber keeps the observer for the first", async () => {
		const first: string[] = [];
		const second: string[] = [];
		subscribe(() => first.push("apply"));
		const unsubLater = subscribe(() => second.push("apply"));

		unsubLater();
		unsubscribers.pop();

		document.documentElement.className = "keep-first";
		await waitForObserver();

		expect(first).toEqual(["apply"]);
		expect(second).toEqual([]);
	});

	test("last unsubscribe disconnects the observer", async () => {
		const calls: string[] = [];
		const unsub = subscribe(() => calls.push("apply"));

		unsub();
		unsubscribers.pop();

		document.documentElement.className = "after-disconnect";
		await waitForObserver();

		expect(calls).toEqual([]);
	});

	test("coalesces many class mutations in one frame into a single apply", async () => {
		const calls: string[] = [];
		subscribe(() => calls.push("apply"));

		document.documentElement.className = "a";
		document.documentElement.className = "b";
		document.documentElement.className = "c";
		await waitForObserver();

		expect(calls).toEqual(["apply"]);
	});

	test("does not re-apply when an unrelated node class changes", async () => {
		const calls: string[] = [];
		subscribe(() => calls.push("apply"));
		const node = document.createElement("div");
		document.body.appendChild(node);

		node.className = "unrelated";
		await waitForObserver();

		expect(calls).toEqual([]);
		node.remove();
	});

	test("re-applies when a document childList mutation replaces the root", async () => {
		const calls: string[] = [];
		subscribe(() => calls.push("apply"));
		const marker = document.createComment("theme-history");

		document.insertBefore(marker, document.documentElement);
		await waitForObserver();
		expect(calls).toEqual(["apply"]);

		marker.remove();
	});

	test("re-applies after popstate when a descendant class is stripped", async () => {
		const calls: string[] = [];
		subscribe(() => calls.push("apply"));
		const node = document.createElement("div");
		document.body.appendChild(node);

		window.dispatchEvent(new window.Event("popstate"));
		expect(calls).toEqual(["apply"]);
		calls.length = 0;

		node.className = "stripped";
		await waitForObserver();

		expect(calls.length).toBeGreaterThan(0);
		node.remove();
	});
});
