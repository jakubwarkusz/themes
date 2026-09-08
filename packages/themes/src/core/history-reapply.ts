// Instant Nav restores a classless snapshot by mutating descendants after popstate.
let n = 0;
let obs: MutationObserver | undefined;
let subtree: MutationObserver | undefined;
let flushRaf = 0;
let applying = 0;
let subtreeFrames = 0;
let subtreeRaf = 0;
const applies = new Set<() => void>();

function flush(): void {
	if (applying || flushRaf) return;
	flushRaf = requestAnimationFrame(() => {
		flushRaf = 0;
		applying = 1;
		for (const subscriber of applies) subscriber();
		applying = 0;
	});
}

function observeHtml(observer: MutationObserver, root: Element): void {
	observer.observe(root, {
		attributes: true,
		attributeFilter: ["class"],
	});
}

function armSubtree(w: Window, Observer: typeof MutationObserver): void {
	if (!subtree) {
		subtree = new Observer(flush);
		subtree.observe(w.document.documentElement, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["class"],
		});
	}
	subtreeFrames = 2;
	if (subtreeRaf) return;
	const tick = () => {
		subtreeRaf = 0;
		if (--subtreeFrames > 0) {
			subtreeRaf = requestAnimationFrame(tick);
			return;
		}
		subtree?.disconnect();
		subtree = undefined;
	};
	subtreeRaf = requestAnimationFrame(tick);
}

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	applies.add(apply);
	const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
		.MutationObserver;
	if (!n++) {
		if (Observer) {
			obs = new Observer(flush);
			obs.observe(w.document, { childList: true });
			observeHtml(obs, w.document.documentElement);
		}
	}
	const onPopstate = () => {
		apply();
		if (Observer) armSubtree(w, Observer);
	};
	w.addEventListener("popstate", onPopstate);
	return () => {
		applies.delete(apply);
		w.removeEventListener("popstate", onPopstate);
		if (!--n) {
			obs?.disconnect();
			obs = undefined;
			subtree?.disconnect();
			subtree = undefined;
			if (flushRaf) {
				cancelAnimationFrame(flushRaf);
				flushRaf = 0;
			}
			if (subtreeRaf) {
				cancelAnimationFrame(subtreeRaf);
				subtreeRaf = 0;
			}
			subtreeFrames = 0;
			applying = 0;
		}
	};
}
