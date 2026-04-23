"use client";

import { type DependencyList, type EffectCallback, useEffect, useRef } from "react";
import { useTheme } from "../core/context.js";

/**
 * Like useEffect, but runs only after the first render
 * and only when theme state changes.
 */
export function useThemeEffect(
	effect: (
		theme: string | undefined,
		resolvedTheme: string | undefined,
	) => ReturnType<EffectCallback>,
	deps: DependencyList = [],
): void {
	const { theme, resolvedTheme } = useTheme();
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		return effect(theme, resolvedTheme);
	}, [theme, resolvedTheme, effect, ...deps]);
}
