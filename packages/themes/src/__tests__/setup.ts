import { GlobalWindow } from "happy-dom";

const win = new GlobalWindow({ url: "http://localhost/" });

Object.defineProperties(globalThis, {
	window: { value: win, writable: true, configurable: true },
	document: { value: win.document, writable: true, configurable: true },
	localStorage: { value: win.localStorage, writable: true, configurable: true },
	sessionStorage: { value: win.sessionStorage, writable: true, configurable: true },
	location: {
		get() {
			return win.location;
		},
		configurable: true,
	},
	matchMedia: {
		// Getter delegates to win.matchMedia so tests can patch window.matchMedia
		get() {
			return (q: string) => win.matchMedia(q);
		},
		configurable: true,
	},
});

if (typeof globalThis.requestAnimationFrame === "undefined") {
	globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
		setTimeout(() => cb(0), 0);
		return 0;
	};
	globalThis.cancelAnimationFrame = () => {};
}

export function clearCookies(): void {
	const cookies = document.cookie.split(";");
	for (const cookie of cookies) {
		const name = cookie.split("=")[0]?.trim();
		// biome-ignore lint/suspicious/noDocumentCookie: test helper intentionally clears cookies via document.cookie
		if (name) document.cookie = `${name}=; max-age=0; path=/`;
	}
}
