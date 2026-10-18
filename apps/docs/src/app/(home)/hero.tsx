import { getGitHubStars } from "@/lib/layout.shared";
import { HeroContent } from "./hero-content";

export async function Hero() {
	const stars = await getGitHubStars();

	return (
		<section className="relative flex flex-col items-center text-center pt-8 pb-16 sm:pt-12 sm:pb-20 max-w-4xl w-full">
			<HeroContent stars={stars} />
		</section>
	);
}
