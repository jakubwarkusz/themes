"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import skyDay from "@/assets/home/sky-day.webp";
import skyNight from "@/assets/home/sky-night.webp";
import { useTheme } from "@wrksz/themes/client";

const SKIES: Record<string, StaticImageData> = { light: skyDay, dark: skyNight };
const SIZES = "(min-width: 896px) 896px, 100vw";

export function HeroSky() {
	const { resolvedTheme } = useTheme();
	const [shown, setShown] = useState(resolvedTheme);
	const [previous, setPrevious] = useState<string | undefined>();
	if (resolvedTheme !== shown) {
		if (shown !== undefined) setPrevious(shown);
		setShown(resolvedTheme);
	}

	if (previous === undefined || shown === undefined) {
		return (
			<>
				<Image
					src={skyDay}
					alt=""
					fill
					priority
					sizes={SIZES}
					className="object-cover dark:hidden"
				/>
				<Image
					src={skyNight}
					alt=""
					fill
					priority
					sizes={SIZES}
					className="hidden object-cover dark:block"
				/>
			</>
		);
	}
	return (
		<>
			<Image
				src={SKIES[previous] ?? skyDay}
				alt=""
				fill
				sizes={SIZES}
				className="object-cover"
			/>
			<Image
				key={shown}
				src={SKIES[shown] ?? skyDay}
				alt=""
				fill
				sizes={SIZES}
				className="sky-in object-cover"
			/>
		</>
	);
}
