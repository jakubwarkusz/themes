"use client";

import { type DependencyList, type EffectCallback, useEffect, useRef } from "react";
import { useTheme } from "../core/context.js";
import type { DefaultTheme, ResolvedTheme, ThemeSelection } from "../core/types.js";
import { useEffectEvent } from "../core/use-effect-event.js";

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
	const onEffect = useEffectEvent(effect);

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect events are intentionally non-reactive.
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		return onEffect(theme, resolvedTheme);
	}, [theme, resolvedTheme, ...deps]);
}
