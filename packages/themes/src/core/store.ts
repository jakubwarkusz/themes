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

	function setState(nextState: ThemeState): void {
		if (state.theme === nextState.theme && state.systemTheme === nextState.systemTheme) return;
		state = nextState;
		for (const listener of listeners) listener();
	}

	return {
		subscribe(listener: () => void): () => void {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},

		getSnapshot(): ThemeState {
			return state;
		},

		getServerSnapshot(): ThemeState {
			return serverSnapshot;
		},

		setState,

		setTheme(theme: string | undefined): void {
			setState({ ...state, theme });
		},

		setSystemTheme(systemTheme: "light" | "dark" | undefined): void {
			setState({ ...state, systemTheme });
		},
	};
}
