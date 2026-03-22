import { getGitHubStars } from "@/lib/layout.shared";
import { HeroContent } from "./hero-content";

export async function Hero() {
	const stars = await getGitHubStars();

	return (
		<section className="relative flex flex-col items-center text-center pt-20 pb-16 sm:pt-28 sm:pb-20 max-w-2xl w-full">
			<HeroContent stars={stars} />
		</section>
	);
}
