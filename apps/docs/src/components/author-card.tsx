import type { ReactNode } from "react";
import type { GitHubUser } from "@/lib/github-releases";

export type Person = {
	login: string;
	user: GitHubUser | null;
	total: number;
	first: string;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function AuthorCard({
	person,
	release,
	inRelease,
	children,
}: {
	person: Person;
	release: string;
	inRelease: number;
	children: ReactNode;
}) {
	const { login, user } = person;

	return (
		<span className="group/author relative inline-flex focus-within:z-30 hover:z-30">
			{children}
			<span className="pointer-events-none invisible absolute top-full left-0 z-30 pt-2 opacity-0 transition-[opacity,visibility] duration-150 ease-out group-focus-within/author:pointer-events-auto group-focus-within/author:visible group-focus-within/author:opacity-100 group-hover/author:pointer-events-auto group-hover/author:visible group-hover/author:opacity-100 group-hover/author:delay-300">
				<span className="flex w-64 flex-col gap-2.5 rounded-xl bg-fd-popover p-3 text-start font-sans text-xs leading-relaxed text-fd-muted-foreground shadow-[0_10px_24px_rgb(0_0_0/0.09),0_2px_8px_rgb(0_0_0/0.06),0_0_0_1px_var(--color-fd-border)]">
					<span className="flex items-center gap-2.5">
						<img
							src={`https://github.com/${login}.png?size=72`}
							alt=""
							width={36}
							height={36}
							loading="lazy"
							className="size-9 shrink-0 rounded-full bg-fd-secondary"
						/>
						<span className="flex min-w-0 flex-col">
							<span className="truncate text-sm font-medium text-fd-foreground">
								{user?.name ?? login}
							</span>
							<span className="truncate">@{login}</span>
						</span>
					</span>
					{user?.bio ? <span className="line-clamp-3">{user.bio}</span> : null}
					{user?.location || user ? (
						<span className="flex flex-wrap gap-x-3 gap-y-1">
							{user?.location ? <span>{user.location}</span> : null}
							{user ? <span>{plural(user.followers, "follower")}</span> : null}
						</span>
					) : null}
					<span className="flex flex-col gap-0.5 border-t pt-2.5">
						<span>
							<span className="text-fd-foreground tabular-nums">{inRelease}</span>{" "}
							{inRelease === 1 ? "change" : "changes"} in {release}
						</span>
						<span>
							<span className="text-fd-foreground tabular-nums">{person.total}</span>{" "}
							{person.total === 1 ? "change" : "changes"} in total, first in{" "}
							{person.first}
						</span>
					</span>
				</span>
			</span>
		</span>
	);
}
