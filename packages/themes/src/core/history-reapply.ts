// Instant Nav restores a classless snapshot by mutating descendants after popstate.
let n = 0;
let obs: MutationObserver | undefined;
let subtree: MutationObserver | undefined;
let html: Element | undefined;
let flushRaf = 0;
let applying = 0;
let subtreeClose: ReturnType<typeof setTimeout> | 0 = 0;
const applies = new Set<() => void>();

function flush(): void {
	if (applying || flushRaf) return;
	flushRaf = requestAnimationFrame(() => {
		flushRaf = 0;
		applying = 1;
		for (const subscriber of applies) subscriber();
		obs?.takeRecords();
		subtree?.takeRecords();
		applying = 0;
	});
}

function bindHtml(observer: MutationObserver, root: Element): void {
	if (html === root) return;
	html = root;
	observer.observe(root, {
		attributes: true,
		attributeFilter: ["class"],
	});
}

function armSubtree(w: Window, Observer: typeof MutationObserver): void {
	const root = w.document.documentElement;
	if (!subtree) subtree = new Observer(flush);
	else subtree.disconnect();
	subtree.observe(root, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["class"],
	});
	if (subtreeClose) clearTimeout(subtreeClose);
	subtreeClose = setTimeout(() => {
		subtreeClose = 0;
		subtree?.disconnect();
		subtree = undefined;
	}, 1000);
}

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	applies.add(apply);
	const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
		.MutationObserver;
	if (!n++) {
		if (Observer) {
			obs = new Observer(() => {
				const root = w.document.documentElement;
				if (obs && html !== root) {
					bindHtml(obs, root);
					if (subtree) armSubtree(w, Observer);
				}
				flush();
			});
			obs.observe(w.document, { childList: true });
			bindHtml(obs, w.document.documentElement);
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
			html = undefined;
			if (flushRaf) {
				cancelAnimationFrame(flushRaf);
				flushRaf = 0;
			}
			if (subtreeClose) {
				clearTimeout(subtreeClose);
				subtreeClose = 0;
			}
			applying = 0;
		}
	};
}
