import { writeCookie } from "./cookie.js";
import type { Attribute, ThemeColor, ThemeProviderProps } from "./types.js";

type ApplyThemeOptions = {
	resolved: string;
	attribute: Attribute | readonly Attribute[];
	themes: readonly string[];
	valueMap: Partial<Record<string, string>> | undefined;
	target: string;
	disableTransitionOnChange: boolean | string;
	enableColorScheme: boolean;
	themeColor: ThemeColor | undefined;
	themeRoot?: Element | ShadowRoot;
	previous?: AppliedThemeState;
};

export type AppliedThemeState = {
	element: Element;
	classTokens: string[];
	dataAttributes: string[];
	colorSchemeApplied: boolean;
	themeColorMeta:
	| {
		element: HTMLMetaElement;
		created: boolean;
		previousContent: string | null;
	}
	| undefined;
};

function resolveThemeColor(themeColor: ThemeColor, resolved: string): string | undefined {
	if (typeof themeColor === "string") return themeColor;
	return themeColor[resolved];
}

function updateMetaThemeColor(
	color: string,
	previous: AppliedThemeState["themeColorMeta"],
): NonNullable<AppliedThemeState["themeColorMeta"]> {
	let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
	const created = !meta;
	if (!meta) {
		meta = document.createElement("meta");
		meta.name = "theme-color";
		document.head.appendChild(meta);
	}
	const state = previous ?? {
		element: meta,
		created,
		previousContent: created ? null : meta.getAttribute("content"),
	};
	meta.content = color;
	return state;
}

function restoreMetaThemeColor(state: AppliedThemeState["themeColorMeta"]): void {
	if (!state) return;
	if (state.created) {
		state.element.remove();
		return;
	}
	if (state.previousContent === null) state.element.removeAttribute("content");
	else state.element.setAttribute("content", state.previousContent);
}

function classAttributeNeedsUpdate(
	el: Element,
	currentValues: string[],
	nextValues: string[],
): boolean {
	return (
		currentValues.some(
			(token) => !nextValues.includes(token) && el.classList.contains(token),
		) || nextValues.some((token) => !el.classList.contains(token))
	);
}

function getTargetEl(target: string, themeRoot?: Element | ShadowRoot): Element | null {
	if (themeRoot && "host" in themeRoot) return themeRoot.host;
	if (typeof Element !== "undefined" && themeRoot instanceof Element) return themeRoot;
	if (target === "html") return document.documentElement;
	if (target === "body") return document.body;
	return document.querySelector(target);
}

function reportStorageError(
	onStorageError: ((error: unknown) => void) | undefined,
	error: unknown,
): void {
	try {
		onStorageError?.(error);
	} catch { }
}

function readCookieValue(key: string): string | null {
	const parts = `; ${document.cookie}`.split(`; ${key}=`);
	const encoded = parts.length > 1 ? parts.pop()?.split(";")[0] : null;
	let decoded: string | null = null;
	try {
		decoded = encoded ? decodeURIComponent(encoded) : null;
	} catch { }
	return decoded ? decoded : null;
}

export function getDomWindow(): (Window & typeof globalThis) | null {
	if (typeof document === "undefined") return null;
	return document.defaultView;
}

export function readStoredTheme(
	storage: ThemeProviderProps["storage"],
	storageKey: string,
	onStorageError?: (error: unknown) => void,
): string | null {
	try {
		if (storage === "none") return null;
		if (storage === "cookie") return readCookieValue(storageKey);
		if (storage === "hybrid")
			return readCookieValue(storageKey) ?? localStorage.getItem(storageKey);
		if (storage === "localStorage") return localStorage.getItem(storageKey);
		return sessionStorage.getItem(storageKey);
	} catch (error) {
		reportStorageError(onStorageError, error);
		return null;
	}
}

export function writeStoredTheme(
	storage: ThemeProviderProps["storage"],
	storageKey: string,
	theme: string,
	cookieOptions: ThemeProviderProps["cookieOptions"],
	onStorageError?: (error: unknown) => void,
): void {
	try {
		if (storage === "none") return;
		if (storage === "cookie") {
			writeCookie(storageKey, theme, cookieOptions);
			return;
		}
		if (storage === "hybrid") {
			writeCookie(storageKey, theme, cookieOptions);
			localStorage.setItem(storageKey, theme);
			return;
		}
		if (storage === "localStorage") {
			localStorage.setItem(storageKey, theme);
			return;
		}
		sessionStorage.setItem(storageKey, theme);
	} catch (error) {
		reportStorageError(onStorageError, error);
	}
}

export function applyThemeToDom({
	resolved,
	attribute,
	themes,
	valueMap,
	target,
	disableTransitionOnChange,
	enableColorScheme,
	themeColor,
	themeRoot,
	previous,
}: ApplyThemeOptions): AppliedThemeState | undefined {
	const el = getTargetEl(target, themeRoot);
	if (!el) return previous;

	const attrValue = valueMap?.[resolved] ?? resolved;
	const attrs = Array.isArray(attribute) ? attribute : [attribute];
	const classValues = themes.flatMap((t) => (valueMap?.[t] ?? t).split(" "));
	const nextClassValues = attrValue.split(" ");
	const nextDataAttributes = attrs.filter((attr) => attr !== "class");

	if (previous) {
		if (previous.element !== el) {
			previous.element.classList.remove(...previous.classTokens);
			for (const attr of previous.dataAttributes) previous.element.removeAttribute(attr);
			if (previous.colorSchemeApplied)
				(previous.element as HTMLElement).style.colorScheme = "";
		} else {
			const obsoleteClasses = previous.classTokens.filter(
				(token) => !nextClassValues.includes(token),
			);
			if (obsoleteClasses.length > 0) el.classList.remove(...obsoleteClasses);
			for (const attr of previous.dataAttributes) {
				if (!nextDataAttributes.includes(attr as Attribute)) el.removeAttribute(attr);
			}
		}
	}

	let needsUpdate = false;
	let classChanged = false;
	for (const attr of attrs) {
		if (attr === "class") {
			classChanged = classAttributeNeedsUpdate(el, classValues, nextClassValues);
			needsUpdate = needsUpdate || classChanged;
		} else {
			needsUpdate = needsUpdate || el.getAttribute(attr) !== attrValue;
		}
	}

	if (needsUpdate && disableTransitionOnChange) {
		const transitionValue =
			typeof disableTransitionOnChange === "string" ? disableTransitionOnChange : "none";
		const style = document.createElement("style");
		style.textContent = `*,*::before,*::after{transition:${transitionValue}!important}`;
		const styleRoot = themeRoot && "host" in themeRoot ? themeRoot : document.head;
		styleRoot.appendChild(style);
		requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
	}

	for (const attr of attrs) {
		if (attr === "class") {
			if (classChanged) {
				el.classList.remove(...classValues);
				el.classList.add(...nextClassValues);
			}
		} else if (el.getAttribute(attr) !== attrValue) {
			el.setAttribute(attr, attrValue);
		}
	}

	if (enableColorScheme && (resolved === "light" || resolved === "dark")) {
		(el as HTMLElement).style.colorScheme = resolved;
	} else if (previous?.colorSchemeApplied) {
		(el as HTMLElement).style.colorScheme = "";
	}

	let themeColorMeta = previous?.themeColorMeta;
	if (themeColor) {
		const color = resolveThemeColor(themeColor, resolved);
		if (color) themeColorMeta = updateMetaThemeColor(color, themeColorMeta);
		else {
			restoreMetaThemeColor(themeColorMeta);
			themeColorMeta = undefined;
		}
	} else {
		restoreMetaThemeColor(themeColorMeta);
		themeColorMeta = undefined;
	}

	return {
		element: el,
		classTokens: nextClassValues,
		dataAttributes: nextDataAttributes,
		colorSchemeApplied: enableColorScheme && (resolved === "light" || resolved === "dark"),
		themeColorMeta,
	};
}
