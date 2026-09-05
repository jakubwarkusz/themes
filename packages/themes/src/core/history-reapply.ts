let n = 0;
let obs: MutationObserver | undefined;
let run: (() => void) | undefined;

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	run = apply;
	const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
		.MutationObserver;
	if (!n && Observer) {
		(obs = new Observer(() => run?.())).observe(w.document, { childList: true });
		obs.observe(w.document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
	}
	n++;
	w.addEventListener("popstate", apply);
	return () => {
		w.removeEventListener("popstate", apply);
		if (!--n) obs?.disconnect();
	};
}
