let htmlObs: boolean | undefined;

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	let obs: MutationObserver | undefined;
	const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
		.MutationObserver;
	if (!htmlObs && Observer) {
		htmlObs = true;
		(obs = new Observer(apply)).observe(w.document, {
			childList: true,
			subtree: true,
			attributeFilter: ["class"],
		});
	}
	w.addEventListener("popstate", apply);
	return () => {
		if (obs) {
			obs.disconnect();
			htmlObs = false;
		}
		w.removeEventListener("popstate", apply);
	};
}
