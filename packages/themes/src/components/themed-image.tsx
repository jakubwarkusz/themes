"use client";

import type { ImgHTMLAttributes, ReactElement } from "react";
import { ThemeContext, type ThemeContextInstance, useThemeFromContext } from "../core/context.js";
import type { ResolvedTheme } from "../core/types.js";

// Transparent 1x1 GIF - shown before theme resolves to avoid hydration mismatch
const TRANSPARENT_FALLBACK =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export type ThemedImageProps<Themes extends string = string> = Omit<
	ImgHTMLAttributes<HTMLImageElement>,
	"src" | "alt"
> & {
	/** Map of theme name to image source */
	src: Record<ResolvedTheme<Themes>, string>;
	/**
	 * Shown before the theme resolves on the client.
	 * Defaults to a transparent 1x1 GIF to avoid hydration mismatch.
	 */
	fallback?: string;
	/** Alt text (required for accessibility) */
	alt: string;
};

type InternalThemedImageProps<Themes extends string> = ThemedImageProps<Themes> & {
	/** @internal Context used by createThemes factory instances. */
	themeContext?: ThemeContextInstance<Themes>;
};

export function ThemedImage<Themes extends string = string>({
	src,
	fallback = TRANSPARENT_FALLBACK,
	alt,
	themeContext = ThemeContext as ThemeContextInstance<Themes>,
	...props
}: InternalThemedImageProps<Themes>): ReactElement {
	const { resolvedTheme } = useThemeFromContext(themeContext);

	const resolvedSrc = (resolvedTheme && src[resolvedTheme]) || fallback;

	// biome-ignore lint/performance/noImgElement: component is framework-agnostic and cannot depend on next/image
	return <img src={resolvedSrc} alt={alt} {...props} />;
}
