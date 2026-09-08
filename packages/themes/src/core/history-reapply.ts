// Instant Nav restores a classless snapshot by mutating descendants after popstate.
let n = 0;
let docObs: MutationObserver | undefined;
let htmlObs: MutationObserver | undefined;
let subtree: MutationObserver | undefined;
let html: Element | undefined;
let q = 0;
let close = 0;
const applies = new Set<() => void>();

function flush(): void {
	if (q) return;
	q = 1;
	requestAnimationFrame(() => {
		for (const subscriber of applies) subscriber();
		docObs?.takeRecords();
		htmlObs?.takeRecords();
		subtree?.takeRecords();
		q = 0;
	});
}

function watchHtml(Observer: typeof MutationObserver, root: Element): void {
	if (html === root && htmlObs) return;
	html = root;
	htmlObs?.disconnect();
	(htmlObs = new Observer(flush)).observe(root, {
		childList: true,
		attributes: true,
		attributeFilter: ["class"],
	});
}

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	applies.add(apply);
	const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
		.MutationObserver;
	if (!n++) {
		if (Observer) {
			docObs = new Observer(() => {
				watchHtml(Observer, w.document.documentElement);
				flush();
			});
			docObs.observe(w.document, { childList: true });
			watchHtml(Observer, w.document.documentElement);
		}
	}
	const onPopstate = () => {
		apply();
		if (!Observer) return;
		const root = w.document.documentElement;
		watchHtml(Observer, root);
		subtree?.disconnect();
		(subtree = new Observer(flush)).observe(root, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["class"],
		});
		if (close) clearTimeout(close);
		close = w.setTimeout(() => {
			close = 0;
			subtree?.disconnect();
			subtree = undefined;
		}, 2000);
	};
	w.addEventListener("popstate", onPopstate);
	return () => {
		applies.delete(apply);
		w.removeEventListener("popstate", onPopstate);
		if (!--n) {
			docObs?.disconnect();
			htmlObs?.disconnect();
			subtree?.disconnect();
			docObs = htmlObs = subtree = undefined;
			html = undefined;
			if (close) w.clearTimeout(close);
			close = q = 0;
		}
	};
}
