let htmlObs: boolean | undefined;

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	let obs: MutationObserver | undefined;
	const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
		.MutationObserver;
	if (!htmlObs && Observer) {
		htmlObs = true;
		(obs = new Observer(apply)).observe(w.document.documentElement, {
			attributeFilter: ["class"],
		});
	}
	const ev = ["popstate", "pageshow"];
	for (const e of ev) w.addEventListener(e, apply);
	return () => {
		if (obs) {
			obs.disconnect();
			htmlObs = false;
		}
		for (const e of ev) w.removeEventListener(e, apply);
	};
}
