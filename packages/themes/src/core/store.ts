type ThemeState = {
	theme: string | undefined;
	systemTheme: "light" | "dark" | undefined;
};

export type ThemeStore = {
	subscribe(listener: () => void): () => void;
	getSnapshot(): ThemeState;
	getServerSnapshot(): ThemeState;
	setState(nextState: ThemeState): void;
	setTheme(theme: string | undefined): void;
	setSystemTheme(systemTheme: "light" | "dark" | undefined): void;
};

export function createThemeStore(seedTheme?: string): ThemeStore {
	const serverSnapshot: ThemeState = { theme: seedTheme, systemTheme: undefined };
	let state: ThemeState = serverSnapshot;
	const listeners = new Set<() => void>();
	const setState = (nextState: ThemeState): void => {
		if (state.theme === nextState.theme && state.systemTheme === nextState.systemTheme) return;
		state = nextState;
		for (const listener of listeners) listener();
	};

	return {
		subscribe(listener) {
			listeners.add(listener);
			return () => void listeners.delete(listener);
		},
		getSnapshot: () => state,
		getServerSnapshot: () => serverSnapshot,
		setState,
		setTheme: (theme) => setState({ ...state, theme }),
		setSystemTheme: (systemTheme) => setState({ ...state, systemTheme }),
	};
}
