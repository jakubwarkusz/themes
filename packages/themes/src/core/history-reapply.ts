// Instant Nav restores a classless snapshot by mutating descendants after popstate.
let n = 0;
let obs: MutationObserver | undefined;
let run: () => void;
let q = 0;

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	if (!n++) {
		run = apply;
		const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
			.MutationObserver;
		if (Observer) {
			(obs = new Observer(() => {
				if (!q) {
					q = 1;
					requestAnimationFrame(() => {
						q = 0;
						run();
					});
				}
			})).observe(w.document, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ["class"],
			});
		}
	}
	w.addEventListener("popstate", apply);
	return () => {
		w.removeEventListener("popstate", apply);
		if (!--n) obs?.disconnect();
	};
}
