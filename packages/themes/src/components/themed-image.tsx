"use client";

import type { ImgHTMLAttributes, ReactElement } from "react";
import { useTheme } from "../core/context.js";

// Transparent 1x1 GIF - shown before theme resolves to avoid hydration mismatch
const TRANSPARENT_FALLBACK =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export type ThemedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
	/** Map of theme name to image source */
	src: Record<string, string>;
	/**
	 * Shown before the theme resolves on the client.
	 * Defaults to a transparent 1x1 GIF to avoid hydration mismatch.
	 */
	fallback?: string;
	/** Alt text (required for accessibility) */
	alt: string;
};

export function ThemedImage({
	src,
	fallback = TRANSPARENT_FALLBACK,
	alt,
	...props
}: ThemedImageProps): ReactElement {
	const { resolvedTheme } = useTheme();

	const resolvedSrc = (resolvedTheme && src[resolvedTheme]) || fallback;

	// biome-ignore lint/performance/noImgElement: component is framework-agnostic and cannot depend on next/image
	return <img src={resolvedSrc} alt={alt} {...props} />;
}
