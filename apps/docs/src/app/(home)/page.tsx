import { Comparison } from "./comparison";
import { FeaturesGrid } from "./features";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Roadmap } from "./roadmap";

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
			<Hero />
			<FeaturesGrid />
			<Comparison />
			<Roadmap />
			<Footer />
		</main>
	);
}
