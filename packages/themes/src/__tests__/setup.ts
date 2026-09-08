// Vitest provides the happy-dom window and browser globals.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

export function clearCookies(): void {
	const cookies = document.cookie.split(";");
	for (const cookie of cookies) {
		const name = cookie.split("=")[0]?.trim();
		// test helper intentionally clears cookies via document.cookie
		if (name) document.cookie = `${name}=; max-age=0; path=/`;
	}
}
