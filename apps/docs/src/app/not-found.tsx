import Image from "next/image";
import { HeroSky } from "@/app/(home)/hero-sky";
import sticker from "@/assets/home/sticker.png";
import { Button } from "@/components/button";

export default function NotFound() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
			<div className="w-full max-w-xl">
				<div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl sm:h-40">
					<HeroSky />
					<Image src={sticker} alt="" priority className="relative size-14 sm:size-16" />
				</div>
				<h1 className="mt-8 text-lg font-medium leading-snug text-fd-foreground">
					Page not found
				</h1>
				<p className="text-base leading-relaxed text-fd-muted-foreground">
					This page doesn&apos;t exist or has moved.
				</p>
				<div className="mt-6 flex flex-wrap items-center gap-2">
					<Button href="/">Back home</Button>
					<Button href="/docs" variant="secondary">
						Read the docs
					</Button>
				</div>
			</div>
		</main>
	);
}
