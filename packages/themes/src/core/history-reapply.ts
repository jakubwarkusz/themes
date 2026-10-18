// Instant Nav can restore a classless snapshot after popstate listeners run.
const listeners = new Map<() => void, { target: () => Element | null; element: Element | null }>();
const pending = new Set<() => void>();
let observer: MutationObserver | undefined;
let frame: number | undefined;

const options = {
	childList: true,
	subtree: true,
	attributes: true,
	attributeFilter: ["class"],
};

export function subscribeHistoryReapply(
	w: Window,
	apply: () => void,
	getTarget: () => Element | null,
): () => void {
	listeners.set(apply, { target: getTarget, element: getTarget() });
	if (listeners.size === 1) {
		const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
			.MutationObserver;
		if (Observer) {
			observer = new Observer((records) => {
				// Transition styles are removed on later frames; they cannot restore a target.
				for (const [listener, state] of listeners) {
					if (pending.has(listener)) continue;
					const element = state.target();
					if (
						state.element !== element ||
						records.some((record) =>
							record.type === "attributes"
								? !element || record.target.contains(element)
								: [...record.addedNodes, ...record.removedNodes].some(
										(node) =>
											node.nodeName !== "STYLE" &&
											(!element ||
												element.contains(record.target) ||
												node.contains(element)),
									),
						)
					)
						pending.add(listener);
					state.element = element;
				}
				if (!pending.size) return;
				frame ??= w.requestAnimationFrame(() => {
					frame = undefined;
					// Ignore our own writes, including conflicting themes on one target.
					observer?.disconnect();
					try {
						for (const listener of pending) listener();
					} finally {
						pending.clear();
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
		pending.delete(apply);
		if (!listeners.size) {
			observer?.disconnect();
			if (frame !== undefined) w.cancelAnimationFrame(frame);
			frame = undefined;
		}
	};
}
