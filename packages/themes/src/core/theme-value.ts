import type { ThemeSelection } from "./types.js";

export type ThemeValueMap<Themes extends string, Value> = Partial<
	Record<ThemeSelection<Themes>, Value>
> & {
	default?: Value;
};

export function resolveThemeValue<Themes extends string, Value>(
	map: ThemeValueMap<Themes, Value>,
	theme: ThemeSelection<Themes> | undefined,
	resolvedTheme: Themes | undefined,
): Value | undefined {
	if (resolvedTheme && map[resolvedTheme] !== undefined) return map[resolvedTheme];
	if (theme && map[theme] !== undefined) return map[theme];
	return map.default;
}
