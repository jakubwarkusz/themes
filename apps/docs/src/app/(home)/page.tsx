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
