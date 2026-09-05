import dynamic from "next/dynamic";
import { MotionProvider } from "@/components/motion-provider";
import { Footer } from "./footer";
import { Hero } from "./hero";

const FeaturesGrid = dynamic(() => import("./features").then((mod) => mod.FeaturesGrid));
const Comparison = dynamic(() => import("./comparison").then((mod) => mod.Comparison));
const Roadmap = dynamic(() => import("./roadmap").then((mod) => mod.Roadmap));

export default function HomePage() {
	return (
		<main className="relative flex flex-col items-center px-4 overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-full max-w-3xl blur-[100px]"
				style={{
					background:
						"radial-gradient(ellipse at 50% -10%, oklch(0.541 0.247 293.009 / 0.15), transparent 65%)",
				}}
			/>
			<MotionProvider>
				<Hero />
			</MotionProvider>
			<MotionProvider>
				<FeaturesGrid />
				<Comparison />
				<Roadmap />
			</MotionProvider>
			<Footer />
		</main>
	);
}
