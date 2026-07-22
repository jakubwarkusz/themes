"use client";

import { type DependencyList, type EffectCallback, useEffect, useRef } from "react";
import { useTheme } from "../core/context.js";
import type { DefaultTheme, ResolvedTheme, ThemeSelection } from "../core/types.js";

/**
 * Like useEffect, but runs only after the first render
 * and only when theme state changes.
 */
export function useThemeEffect<Themes extends string = DefaultTheme>(
	effect: (
		theme: ThemeSelection<Themes> | undefined,
		resolvedTheme: ResolvedTheme<Themes> | undefined,
	) => ReturnType<EffectCallback>,
	deps: DependencyList = [],
): void {
	const { theme, resolvedTheme } = useTheme<Themes>();
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		return effect(theme, resolvedTheme);
	}, [theme, resolvedTheme, effect, ...deps]);
}
