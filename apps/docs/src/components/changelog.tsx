import {
	Alert02Icon,
	BookOpen01Icon,
	Exchange01Icon,
	FlashIcon,
	MoreHorizontalIcon,
	PlusSignIcon,
	Settings02Icon,
	Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { gitConfig } from "@/lib/layout.shared";
import { getReleases, isLegacy, isMajor, type Release } from "@/lib/changelog";
import { Heading } from "./heading";
import { Badge } from "./mdx-badges";
import { OlderReleases } from "./older-releases";

const REPO = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

const MIGRATION: Record<string, string> = {
	"2.0.0": "/docs/migration#upgrading-from-1x",
};

const GROUP_ICONS: Record<string, IconSvgElement> = {
	"Breaking Changes": Alert02Icon,
	Added: PlusSignIcon,
	Fixed: Wrench01Icon,
	Performance: FlashIcon,
	Changed: Exchange01Icon,
	Documentation: BookOpen01Icon,
	Miscellaneous: Settings02Icon,
};

const DATE = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

const quiet =
	"link-underline-center w-fit text-sm text-fd-muted-foreground transition-colors duration-150 hover:text-fd-foreground";

function Inline({ text }: { text: string }) {
	let offset = 0;
	return text.split(/(`[^`]+`|#\d+\b)/).map((part) => {
		const at = offset;
		offset += part.length;
		if (/^`.+`$/.test(part)) return <code key={at}>{part.slice(1, -1)}</code>;
		if (/^#\d+$/.test(part))
			return (
				<a
					key={at}
					href={`${REPO}/issues/${part.slice(1)}`}
					target="_blank"
					rel="noreferrer"
					className="underline decoration-fd-border underline-offset-[3px] transition-[text-decoration-color] duration-150 hover:decoration-fd-foreground"
				>
					{part}
				</a>
			);
		return part;
	});
}

function ReleaseEntry({ release, latest }: { release: Release; latest: boolean }) {
	const migration = MIGRATION[release.version];

	return (
		<section className="grid gap-x-10 gap-y-4 border-t py-8 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
			<div className="flex flex-col gap-1 sm:sticky sm:top-[calc(var(--fd-docs-row-1,0px)+1.5rem)] sm:self-start">
				<Heading
					as="h2"
					id={release.id}
					className="font-mono text-[15px] font-medium text-fd-foreground"
				>
					{release.version}
				</Heading>
				{release.date ? (
					<time dateTime={release.date} className="text-sm text-fd-muted-foreground">
						{DATE.format(new Date(release.date))}
					</time>
				) : null}
				{latest || isMajor(release) ? (
					<div className="my-1 flex flex-wrap gap-1">
						{latest ? (
							<Badge tone="success" dot>
								Latest
							</Badge>
						) : null}
						{isMajor(release) ? <Badge tone="neutral">Major</Badge> : null}
					</div>
				) : null}
				{migration ? (
					<Link href={migration} className={quiet}>
						Migration guide
					</Link>
				) : null}
				{release.url ? (
					<a href={release.url} target="_blank" rel="noreferrer" className={quiet}>
						Compare
					</a>
				) : null}
				{release.date ? (
					<a
						href={`https://www.npmjs.com/package/@wrksz/themes/v/${release.version}`}
						target="_blank"
						rel="noreferrer"
						className={quiet}
					>
						npm
					</a>
				) : null}
			</div>
			<div className="flex flex-col gap-6 sm:pt-0.5">
				{release.groups.map((group) =>
					group.items.length ? (
						<div key={group.name}>
							<h3 className="flex items-center gap-2 text-sm font-medium text-fd-muted-foreground">
								<HugeiconsIcon
									icon={GROUP_ICONS[group.name] ?? MoreHorizontalIcon}
									size={14}
									color="currentColor"
									strokeWidth={1.8}
								/>
								{group.name}
							</h3>
							<ul className="mt-2.5 flex flex-col gap-2 text-sm leading-relaxed text-fd-foreground [&_code]:rounded-sm [&_code]:bg-fd-secondary [&_code]:px-[0.35em] [&_code]:py-[0.15em] [&_code]:font-mono [&_code]:text-[0.9em]">
								{group.items.map((item) => (
									<li
										key={item.commit?.hash ?? `${item.scope ?? ""}${item.text}`}
										className="flex gap-2"
									>
										<span
											aria-hidden
											className="flex h-[1.625em] w-3.5 shrink-0 items-center justify-center"
										>
											<span className="size-1 rounded-full bg-fd-muted-foreground/60" />
										</span>
										<span className="min-w-0">
											{item.breaking ? (
												<span className="me-2">
													<Badge tone="danger" dot>
														Breaking
													</Badge>
												</span>
											) : null}
											{item.scope ? (
												<span className="me-2 font-mono text-xs text-fd-muted-foreground">
													{item.scope}
												</span>
											) : null}
											<Inline text={item.text} />
											{item.commit ? (
												<a
													href={item.commit.url}
													target="_blank"
													rel="noreferrer"
													aria-label={`Commit ${item.commit.hash}`}
													className="ms-2 font-mono text-xs text-fd-muted-foreground transition-colors duration-150 hover:text-fd-foreground"
												>
													{item.commit.hash}
												</a>
											) : null}
										</span>
									</li>
								))}
							</ul>
						</div>
					) : null,
				)}
			</div>
		</section>
	);
}

export async function Changelog() {
	const releases = await getReleases();
	const current = releases.filter((release) => !isLegacy(release));
	const legacy = releases.filter(isLegacy);
	const latest = releases.find((release) => release.date)?.id;

	return (
		<div className="not-prose mt-2 flex flex-col [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
			{current.map((release) => (
				<ReleaseEntry key={release.id} release={release} latest={release.id === latest} />
			))}
			{legacy.length ? (
				<OlderReleases
					count={legacy.length}
					range={`${legacy.at(-1)?.version} - ${legacy[0].version}`}
				>
					{legacy.map((release) => (
						<ReleaseEntry key={release.id} release={release} latest={false} />
					))}
				</OlderReleases>
			) : null}
		</div>
	);
}
