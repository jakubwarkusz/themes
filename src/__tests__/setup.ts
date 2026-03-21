import { GlobalWindow } from "happy-dom";

const win = new GlobalWindow();

Object.defineProperties(globalThis, {
	window: { value: win, writable: true, configurable: true },
	document: { value: win.document, writable: true, configurable: true },
	localStorage: { value: win.localStorage, writable: true, configurable: true },
	sessionStorage: { value: win.sessionStorage, writable: true, configurable: true },
	matchMedia: {
		// Getter delegates to win.matchMedia so tests can patch window.matchMedia
		get() {
			return (q: string) => win.matchMedia(q);
		},
		configurable: true,
	},
});
