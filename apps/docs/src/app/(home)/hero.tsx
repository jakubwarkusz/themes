import { getGitHubStars } from "@/lib/layout.shared";
import { HeroContent } from "./hero-content";

export async function Hero() {
	const stars = await getGitHubStars();

	return (
		<section className="relative flex w-full max-w-4xl flex-col pt-6 pb-16 sm:pt-8 sm:pb-24">
			<HeroContent stars={stars} />
		</section>
	);
}
