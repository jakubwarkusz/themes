/**
 * Readable extended bootstrap source of truth.
 *
 * Do not import this module from runtime package code — `scripts/generate-script-source.ts`
 * minifies it into `extended-script-source.ts`, which is what `getExtendedScript` ships.
 *
 * Prefer string concatenation over template literals so the minified shipped source stays
 * free of `${...}` placeholders inside a normal string constant.
 */
export function extendedThemeBootstrap(
	storageKey: string,
	attribute: string | string[],
	defaultTheme: string,
	enableSystem: boolean,
	enableColorScheme: boolean,
	forcedTheme: string | null,
	themes: string[],
	value: Record<string, string> | null,
	target: string,
	storage: string,
	themeColors: string | Record<string, string> | null,
	initialTheme: string | null,
	disableTransitionOnChange: boolean | string,
	followSystem: boolean,
	systemThemeMap:
		| { light: string; dark: string }
		| Record<string, { light: string; dark: string }>
		| null,
): void {
	let selection: string;

	if (forcedTheme) {
		selection = forcedTheme;
	} else if (
		initialTheme &&
		(themes.includes(initialTheme) || (enableSystem && initialTheme === "system"))
	) {
		selection = initialTheme;
	} else {
		let stored: string | null = null;
		if (!followSystem) {
			try {
				if (storage === "cookie" || storage === "hybrid") {
					const parts = ("; " + document.cookie).split("; " + storageKey + "=");
					const encoded = parts.length > 1 ? parts.pop()?.split(";")[0] : null;
					const fromCookie = encoded ? decodeURIComponent(encoded) : null;
					stored =
						storage === "hybrid"
							? (fromCookie ?? localStorage.getItem(storageKey))
							: fromCookie;
				} else if (storage !== "none") {
					const store = storage === "localStorage" ? localStorage : sessionStorage;
					stored = store.getItem(storageKey);
				}
			} catch {}
		}
		selection =
			stored && (themes.includes(stored) || (enableSystem && stored === "system"))
				? stored
				: defaultTheme;
	}

	const systemTheme = enableSystem
		? matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light"
		: null;
	let theme = selection;

	if (systemTheme) {
		const directMap = systemThemeMap as { light?: unknown; dark?: unknown } | null;
		if (
			directMap &&
			typeof directMap.light === "string" &&
			typeof directMap.dark === "string"
		) {
			if (selection === "system")
				theme = (directMap as { light: string; dark: string })[systemTheme];
		} else if (systemThemeMap && selection !== "system") {
			const variantMap = systemThemeMap as Record<
				string,
				{ light: string; dark: string } | undefined
			>;
			theme = variantMap[selection]?.[systemTheme] ?? selection;
		} else if (selection === "system") {
			theme = systemTheme;
		}
	} else if (selection === "system") {
		theme = defaultTheme;
	}

	const attributeValue = value?.[theme] || theme;
	const element: Element | null =
		target === "html"
			? document.documentElement
			: target === "body"
				? document.body
				: document.querySelector(target);
	if (!element) return;

	const attributes = Array.isArray(attribute) ? attribute : [attribute];
	const toRemove = themes.flatMap((current) => (value?.[current] || current).split(" "));
	const toAdd = attributeValue.split(" ");
	let changed = false;
	let classChanged = false;

	for (const current of attributes) {
		if (current === "class") {
			classChanged =
				toRemove.some(
					(token) => !toAdd.includes(token) && element.classList.contains(token),
				) || toAdd.some((token) => !element.classList.contains(token));
			changed = changed || classChanged;
		} else {
			changed = changed || element.getAttribute(current) !== attributeValue;
		}
	}

	if (changed && disableTransitionOnChange) {
		const css =
			typeof disableTransitionOnChange === "string" ? disableTransitionOnChange : "none";
		const style = document.createElement("style");
		style.textContent = "*,*::before,*::after{transition:" + css + "!important}";
		document.head.appendChild(style);
		requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
	}

	for (const current of attributes) {
		if (current === "class") {
			if (classChanged) {
				element.classList.remove(...toRemove);
				element.classList.add(...toAdd);
			}
		} else if (attributeValue) {
			if (element.getAttribute(current) !== attributeValue)
				element.setAttribute(current, attributeValue);
		} else {
			element.removeAttribute(current);
		}
	}

	if (enableColorScheme && (theme === "light" || theme === "dark"))
		(element as HTMLElement).style.colorScheme = theme;

	if (themeColors) {
		const color = typeof themeColors === "string" ? themeColors : themeColors[theme];
		if (color) {
			let meta = document.querySelector('meta[name="theme-color"]');
			if (!meta) {
				meta = document.createElement("meta");
				meta.setAttribute("name", "theme-color");
				document.head.appendChild(meta);
			}
			meta.setAttribute("content", color);
		}
	}
}
