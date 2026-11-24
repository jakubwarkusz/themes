// Instant Nav can restore a classless snapshot after popstate listeners run.
type Subscription = [getTarget: () => Element | null, previousTarget: Element | null];

const listeners = new Map<() => void, Subscription>();
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
	attribute: string | readonly string[] = "class",
): () => void {
	// Root layout swaps clear every theme attribute, not just class.
	options.attributeFilter = [...new Set(options.attributeFilter.concat(attribute))];
	listeners.set(apply, [getTarget, getTarget()]);
	const Observer = (w as unknown as { MutationObserver?: typeof MutationObserver })
		.MutationObserver;
	observer ??=
		Observer &&
		new Observer((records) => {
			// Transition styles are removed on later frames; they cannot restore a target.
			for (const [listener, state] of listeners) {
				if (pending.has(listener)) continue;
				const element = state[0]();
				if (
					state[1] !== element ||
					records.some((record) =>
						record.attributeName
							? !element || record.target.contains(element)
							: [record.addedNodes, record.removedNodes].some((nodes) => {
									const withinTarget =
										!element || element.contains(record.target);
									for (const node of nodes)
										if (
											node.nodeName !== "STYLE" &&
											(withinTarget || node.contains(element))
										)
											return true;
									return false;
								}),
					)
				) {
					pending.add(listener);
					state[1] = element;
				}
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
					observer?.observe(w.document, options);
				}
			});
		});
	observer?.observe(w.document, options);
	w.addEventListener("popstate", apply);
	return () => {
		w.removeEventListener("popstate", apply);
		listeners.delete(apply);
		pending.delete(apply);
		if (!listeners.size) {
			observer?.disconnect();
			observer = undefined;
			options.attributeFilter = ["class"];
			if (frame !== undefined) w.cancelAnimationFrame(frame);
			frame = undefined;
		}
	};
}
