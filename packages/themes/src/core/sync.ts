type ThemeListener = (theme: string) => void;

const channels = new Map<string, Set<ThemeListener>>();

export function subscribeThemeChannel(channel: string, listener: ThemeListener): () => void {
	let listeners = channels.get(channel);
	if (!listeners) {
		listeners = new Set();
		channels.set(channel, listeners);
	}
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0) channels.delete(channel);
	};
}

export function publishThemeChannel(channel: string, theme: string): void {
	const listeners = channels.get(channel);
	if (!listeners) return;
	for (const listener of listeners) listener(theme);
}
