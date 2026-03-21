import { Bug01Icon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

function Bug() {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.75_0.17_55/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.62_0.15_55)]">
			<HugeiconsIcon icon={Bug01Icon} size={10} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">Bug</span>
		</span>
	);
}

function No() {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.65_0.22_25/10%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.58_0.18_25)]">
			<HugeiconsIcon icon={Cancel01Icon} size={10} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">No</span>
		</span>
	);
}

function Fixed({ note }: { note?: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.541_0.247_293/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.65_0.2_293)]">
			<HugeiconsIcon icon={Tick02Icon} size={10} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">{note ? `Fixed (${note})` : "Fixed"}</span>
			<span className="sm:hidden">Fixed</span>
		</span>
	);
}

function Yes({ note }: { note?: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.72_0.18_145/12%)] px-2 py-0.5 text-xs font-medium text-[oklch(0.62_0.18_145)]">
			<HugeiconsIcon icon={Tick02Icon} size={10} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">{note ?? "Yes"}</span>
			<span className="sm:hidden">Yes</span>
		</span>
	);
}

const rows = [
	{
		label: "React 19 script warning",
		next: <Bug />,
		wrksz: <Fixed note="RSC split" />,
	},
	{ label: "__name minification bug", next: <Bug />, wrksz: <Fixed /> },
	{
		label: "React 19 Activity / cacheComponents stale theme",
		next: <Bug />,
		wrksz: <Fixed note="useSyncExternalStore" />,
	},
	{
		label: "Multiple classes per theme",
		next: <Bug />,
		wrksz: <Fixed note="correct class removal" />,
	},
	{
		label: "Nested providers",
		next: <No />,
		wrksz: <Yes note="per-instance store" />,
	},
	{ label: "sessionStorage support", next: <No />, wrksz: <Yes /> },
	{
		label: "Disable storage",
		next: <No />,
		wrksz: <Yes note='storage="none"' />,
	},
	{
		label: "meta theme-color support",
		next: <No />,
		wrksz: <Yes note="themeColor prop" />,
	},
	{
		label: "Server-provided theme",
		next: <No />,
		wrksz: <Yes note="initialTheme prop" />,
	},
	{
		label: "Generic types",
		next: <No />,
		wrksz: <Yes note="useTheme<AppTheme>()" />,
	},
	{ label: "Zero runtime dependencies", next: <Yes />, wrksz: <Yes /> },
];

export function Comparison() {
	return (
		<section className="w-full max-w-4xl pb-16 sm:pb-24">
			<div className="mb-8 text-center">
				<h2 className="text-lg font-semibold text-fd-foreground sm:text-xl">
					Why not next-themes?
				</h2>
				<p className="mt-2 text-sm text-fd-muted-foreground">
					43 open issues, 16 open PRs, React 19 bugs unresolved.
				</p>
			</div>

			{/* Mobile: feature list (wrksz only) */}
			<div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card sm:hidden">
				{rows.map((row, i) => (
					<div
						key={row.label}
						className={`flex items-center justify-between gap-4 px-4 py-3 ${i < rows.length - 1 ? "border-b border-fd-border/60" : ""}`}
					>
						<span className="text-xs text-fd-foreground">{row.label}</span>
						{row.wrksz}
					</div>
				))}
			</div>

			{/* Desktop: table */}
			<div className="hidden overflow-hidden rounded-xl border border-fd-border sm:block">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-fd-border bg-fd-muted/40">
							<th className="px-4 py-2.5 text-left text-xs font-medium text-fd-muted-foreground" />
							<th className="px-4 py-2.5 text-center text-xs font-medium text-fd-muted-foreground">
								next-themes
							</th>
							<th className="px-4 py-2.5 text-center text-xs font-medium text-fd-muted-foreground">
								@wrksz/themes
							</th>
						</tr>
					</thead>
					<tbody className="bg-fd-card">
						{rows.map((row, i) => (
							<tr
								key={row.label}
								className={
									i < rows.length - 1 ? "border-b border-fd-border/60" : ""
								}
							>
								<td className="px-4 py-3 text-xs text-fd-foreground">
									{row.label}
								</td>
								<td className="px-4 py-3 text-center">{row.next}</td>
								<td className="px-4 py-3 text-center">{row.wrksz}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="mt-4 text-center">
				<Link
					href="/docs/why-not-next-themes"
					className="text-xs text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline"
				>
					Read the full breakdown
				</Link>
			</div>
		</section>
	);
}
