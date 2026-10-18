import Link from "next/link";
import { AuthorCard } from "@/components/author-card";
import { getReleases } from "@/lib/changelog";
import { getPeople } from "@/lib/contributors";

export async function Contributors() {
	const people = Object.values(await getPeople(await getReleases())).toSorted(
		(a, b) => b.total - a.total,
	);
	if (!people.length) return null;

	return (
		<section className="w-full max-w-4xl pb-16 sm:pb-20">
			<h2 className="text-base font-medium text-fd-muted-foreground">Contributors</h2>
			<ul className="mt-4 flex flex-wrap gap-2">
				{people.map((person) => (
					<li key={person.login}>
						<AuthorCard person={person}>
							<a
								href={`https://github.com/${person.login}`}
								target="_blank"
								rel="noreferrer"
								aria-label={`@${person.login}`}
								className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
							>
								<img
									src={`https://github.com/${person.login}.png?size=80`}
									alt=""
									width={40}
									height={40}
									loading="lazy"
									className="size-10 rounded-full bg-fd-card"
								/>
							</a>
						</AuthorCard>
					</li>
				))}
			</ul>
			<p className="mt-4 text-sm text-fd-muted-foreground">
				Every release and who shipped it is in the{" "}
				<Link href="/docs/changelog" className="link-underline-center text-fd-foreground">
					changelog
				</Link>
				.
			</p>
		</section>
	);
}
