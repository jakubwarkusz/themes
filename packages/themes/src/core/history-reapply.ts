// Instant Nav can restore a classless snapshot after popstate listeners run.
const listeners = new Set<() => void>();
let observer: MutationObserver | undefined;
let frame: number | undefined;

const options = {
	childList: true,
	subtree: true,
	attributes: true,
	attributeFilter: ["class"],
};

export function subscribeHistoryReapply(w: Window, apply: () => void): () => void {
	listeners.add(apply);
	if (listeners.size === 1) {
		const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
			.MutationObserver;
		if (Observer) {
			observer = new Observer((records) => {
				// Transition styles are removed on later frames; they cannot restore a target.
				if (
					!records.some(
						(record) =>
							record.type === "attributes" ||
							[...record.addedNodes, ...record.removedNodes].some(
								(node) => node.nodeName !== "STYLE",
							),
					)
				)
					return;
				frame ??= w.requestAnimationFrame(() => {
					frame = undefined;
					// Ignore our own writes, including conflicting themes on one target.
					observer?.disconnect();
					try {
						for (const listener of listeners) listener();
					} finally {
						if (listeners.size) observer?.observe(w.document, options);
					}
				});
			});
			observer.observe(w.document, options);
		}
	}
	w.addEventListener("popstate", apply);
	return () => {
		w.removeEventListener("popstate", apply);
		listeners.delete(apply);
		if (!listeners.size) {
			observer?.disconnect();
			if (frame !== undefined) w.cancelAnimationFrame(frame);
			frame = undefined;
		}
	};
}
