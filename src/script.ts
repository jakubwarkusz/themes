import type { Attribute, StorageType } from "./types.js";

export type ScriptConfig = {
	storageKey: string;
	attribute: Attribute | Attribute[];
	defaultTheme: string;
	enableSystem: boolean;
	themes: string[];
	value: Record<string, string> | undefined;
	target: string;
	storage: StorageType;
};

/**
 * Runs inline in <head>, before React hydrates.
 * Params are passed explicitly when serialized via getScript().
 */
function themeScript(
	storageKey: string,
	attribute: string | string[],
	defaultTheme: string,
	enableSystem: boolean,
	themes: string[],
	value: Record<string, string> | null,
	target: string,
	storage: string,
): void {
	let theme: string | null = null;

	// Read from storage
	try {
		if (storage !== "none") {
			const store = storage === "localStorage" ? localStorage : sessionStorage;
			theme = store.getItem(storageKey);
		}
	} catch {}

	if (!theme || !themes.includes(theme)) {
		theme = defaultTheme;
	}

	if (theme === "system") {
		theme = enableSystem
			? matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: defaultTheme;
	}

	const attrValue = value?.[theme] || theme;

	const el: Element | null =
		target === "html"
			? document.documentElement
			: target === "body"
				? document.body
				: document.querySelector(target);

	if (!el) return;

	const attrs = Array.isArray(attribute) ? attribute : [attribute];

	for (const attr of attrs) {
		if (attr === "class") {
			const toRemove = themes.map((t) => value?.[t] || t);
			el.classList.remove(...toRemove);
			el.classList.add(attrValue);
		} else {
			el.setAttribute(attr, attrValue);
		}
	}
}

/**
 * Serializes themeScript into an IIFE string safe for injection into <script>.
 */
export function getScript(config: ScriptConfig): string {
	const fn = themeScript.toString().replace(/\s*__name\s*\([^)]*\)\s*;?\s*/g, "");

	const args = [
		JSON.stringify(config.storageKey),
		JSON.stringify(config.attribute),
		JSON.stringify(config.defaultTheme),
		String(config.enableSystem),
		JSON.stringify(config.themes),
		JSON.stringify(config.value ?? null),
		JSON.stringify(config.target),
		JSON.stringify(config.storage),
	].join(",");

	return `(${fn})(${args})`;
}
