type ThemeState = {
	theme: string | undefined;
	systemTheme: "light" | "dark" | undefined;
};

const SERVER_SNAPSHOT: ThemeState = { theme: undefined, systemTheme: undefined };

export type ThemeStore = {
	subscribe(listener: () => void): () => void;
	getSnapshot(): ThemeState;
	getServerSnapshot(): ThemeState;
	setState(nextState: ThemeState): void;
	setTheme(theme: string | undefined): void;
	setSystemTheme(systemTheme: "light" | "dark" | undefined): void;
};

export function createThemeStore(): ThemeStore {
	let state: ThemeState = { ...SERVER_SNAPSHOT };
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
			return SERVER_SNAPSHOT;
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
