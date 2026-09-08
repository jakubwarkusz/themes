// Instant Nav restores a classless snapshot by mutating descendants after popstate.
let n = 0;
let obs: MutationObserver | undefined;
let q = 0;
const applies = new Set<() => void>();

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	applies.add(apply);
	if (!n++) {
		const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
			.MutationObserver;
		if (Observer) {
			(obs = new Observer(() => {
				if (!q) {
					q = 1;
					requestAnimationFrame(() => {
						q = 0;
						for (const subscriber of applies) subscriber();
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
		applies.delete(apply);
		w.removeEventListener("popstate", apply);
		if (!--n) obs?.disconnect();
	};
}
