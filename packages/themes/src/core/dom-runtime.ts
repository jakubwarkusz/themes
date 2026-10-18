const tokens = new Map<string, string[]>();

export function splitClassTokens(value: string): string[] {
	let cached = tokens.get(value);
	if (!cached) {
		if (tokens.size === 32) tokens.clear();
		cached = value.split(" ").filter(Boolean);
		tokens.set(value, cached);
	}
	return cached;
}

const transitions = new WeakMap<
	ParentNode,
	Map<string, { style: HTMLStyleElement; remaining: number }>
>();

export function disableTransitions(
	value: boolean | string,
	root: ParentNode = document.head,
): void {
	const transition = typeof value === "string" ? value : "none";
	let active = transitions.get(root);
	if (!active) transitions.set(root, (active = new Map()));
	let state = active.get(transition);
	if (!state) {
		const style = document.createElement("style");
		style.textContent = `*,*::before,*::after{transition:${transition}!important}`;
		state = { style, remaining: 0 };
		active.set(transition, state);
		const current = state;
		requestAnimationFrame(function release() {
			if (--current.remaining) requestAnimationFrame(release);
			else {
				style.remove();
				active.delete(transition);
			}
		});
	}
	state.remaining = 2;
	if (root.lastChild !== state.style) root.append(state.style);
}
