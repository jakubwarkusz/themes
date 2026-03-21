type ThemeState = {
	theme: string | undefined;
	systemTheme: "light" | "dark" | undefined;
};

let state: ThemeState = { theme: undefined, systemTheme: undefined };
const listeners = new Set<() => void>();

function emit(): void {
	for (const listener of listeners) listener();
}

const SERVER_SNAPSHOT: ThemeState = { theme: undefined, systemTheme: undefined };

export const themeStore = {
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

	setTheme(theme: string | undefined): void {
		if (state.theme === theme) return;
		state = { ...state, theme };
		emit();
	},

	setSystemTheme(systemTheme: "light" | "dark" | undefined): void {
		if (state.systemTheme === systemTheme) return;
		state = { ...state, systemTheme };
		emit();
	},
};
