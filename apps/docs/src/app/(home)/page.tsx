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
				className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] bg-[radial-gradient(circle,oklch(0_0_0/0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,oklch(1_0_0/0.035)_1px,transparent_1px)] bg-size-[28px_28px]"
				style={{
					WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
					maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-full max-w-3xl blur-[80px]"
				style={{
					background:
						"radial-gradient(ellipse at 50% -5%, oklch(0.541 0.247 293.009 / 0.22), transparent 65%)",
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
