/**
 * Instant Navigation / bfcache can restore a snapshot after `popstate`/`pageshow`.
 * Apply immediately, then once more on the next frame so the restored DOM keeps
 * the current theme.
 */
export function subscribeHistoryReapply(domWindow: Window, apply: () => void): () => void {
	const handler = () => {
		apply();
		domWindow.requestAnimationFrame(apply);
	};
	domWindow.addEventListener("pageshow", handler);
	domWindow.addEventListener("popstate", handler);
	return () => {
		domWindow.removeEventListener("pageshow", handler);
		domWindow.removeEventListener("popstate", handler);
	};
}
