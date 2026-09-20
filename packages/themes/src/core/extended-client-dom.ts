import type { Attribute, ThemeColor } from "./types.js";

export { getDomWindow, readStoredTheme, writeStoredTheme } from "./storage.js";

type ApplyExtendedThemeOptions = {
	resolved: string;
	attribute: Attribute | readonly Attribute[];
	themes: readonly string[];
	valueMap: Partial<Record<string, string>> | undefined;
	target: string;
	disableTransitionOnChange: boolean | string;
	enableColorScheme: boolean;
	themeColor: ThemeColor | undefined;
	themeRoot?: Element | ShadowRoot | undefined;
	previous: AppliedThemeState | undefined;
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
		document.head.append(meta);
	}
	const state = previous ?? {
		element: meta,
		created,
		previousContent: created ? null : meta.getAttribute("content"),
	};
	if (meta.content !== color) meta.content = color;
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

function splitClassTokens(value: string): string[] {
	return value.split(" ").filter((t) => t);
}

function getTargetElement(target: string, themeRoot?: Element | ShadowRoot): Element | null {
	if (themeRoot) {
		if ("host" in themeRoot) return themeRoot.host;
		if ("tagName" in themeRoot) return themeRoot;
	}
	if (target === "html") return document.documentElement;
	if (target === "body") return document.body;
	return document.querySelector(target);
}

export function applyExtendedThemeToDom({
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
}: ApplyExtendedThemeOptions): AppliedThemeState | undefined {
	const element = getTargetElement(target, themeRoot);
	if (!element) return previous;

	const attributeValue = valueMap?.[resolved] ?? resolved;
	const attributes = Array.isArray(attribute) ? attribute : [attribute];
	const hasClass = attributes.includes("class");
	const nextClassValues = hasClass ? splitClassTokens(attributeValue) : [];
	const nextAttrValue = attributeValue || null;
	const nextDataAttributes = attributes.filter((current) => current !== "class");
	const removeClassValues = hasClass
		? previous?.element === element
			? previous.classTokens
			: themes.flatMap((theme) => splitClassTokens(valueMap?.[theme] ?? theme))
		: [];
	const staleClasses = !hasClass && previous?.element === element ? previous.classTokens : [];

	if (previous) {
		if (previous.element !== element) {
			previous.element.classList.remove(...previous.classTokens);
			for (const current of previous.dataAttributes)
				previous.element.removeAttribute(current);
			if (previous.colorSchemeApplied)
				(previous.element as HTMLElement).style.colorScheme = "";
		} else {
			for (const current of previous.dataAttributes) {
				if (!nextDataAttributes.includes(current)) element.removeAttribute(current);
			}
		}
	}

	let needsUpdate = staleClasses.some((token) => element.classList.contains(token));
	let classChanged = false;
	for (const current of attributes) {
		if (current === "class") {
			classChanged =
				removeClassValues.some(
					(token) =>
						!nextClassValues.includes(token) && element.classList.contains(token),
				) || nextClassValues.some((token) => !element.classList.contains(token));
			needsUpdate ||= classChanged;
		} else {
			needsUpdate ||= element.getAttribute(current) !== nextAttrValue;
		}
	}

	if (needsUpdate && disableTransitionOnChange) {
		const transitionValue =
			typeof disableTransitionOnChange === "string" ? disableTransitionOnChange : "none";
		const style = document.createElement("style");
		style.textContent = `*,*::before,*::after{transition:${transitionValue}!important}`;
		const styleRoot = themeRoot && "host" in themeRoot ? themeRoot : document.head;
		styleRoot.append(style);
		requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
	}

	if (staleClasses.length) element.classList.remove(...staleClasses);
	for (const current of attributes) {
		if (current === "class") {
			if (classChanged) {
				element.classList.remove(...removeClassValues);
				element.classList.add(...nextClassValues);
			}
		} else if (element.getAttribute(current) !== nextAttrValue) {
			if (nextAttrValue) element.setAttribute(current, nextAttrValue);
			else element.removeAttribute(current);
		}
	}

	if (enableColorScheme) {
		const style = (element as HTMLElement).style;
		const colorScheme = resolved === "light" || resolved === "dark" ? resolved : "";
		if (style.colorScheme !== colorScheme) style.colorScheme = colorScheme;
	} else if (previous?.colorSchemeApplied) {
		(element as HTMLElement).style.colorScheme = "";
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
		element,
		classTokens: nextClassValues,
		dataAttributes: nextDataAttributes,
		colorSchemeApplied: enableColorScheme && (resolved === "light" || resolved === "dark"),
		themeColorMeta,
	};
}
