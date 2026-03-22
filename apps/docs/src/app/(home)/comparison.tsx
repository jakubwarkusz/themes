import { Bug01Icon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

function Bug() {
	return (
		<span className="inline-flex items-center gap-1 rounded-md border border-red-500/15 bg-red-500/8 px-2 py-0.5 text-xs font-medium text-red-400">
			<HugeiconsIcon icon={Bug01Icon} size={10} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">Bug</span>
		</span>
	);
}

function No() {
	return (
		<span className="inline-flex items-center gap-1 rounded-md border border-fd-border bg-fd-muted px-2 py-0.5 text-xs font-medium text-fd-muted-foreground">
			<HugeiconsIcon icon={Cancel01Icon} size={10} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">No</span>
		</span>
	);
}

function Fixed({ note }: { note?: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-md border border-fd-primary/20 bg-fd-primary/8 px-2 py-0.5 text-xs font-medium text-fd-primary">
			<HugeiconsIcon icon={Tick02Icon} size={10} color="currentColor" strokeWidth={2} />
			<span className="hidden sm:inline">{note ? `Fixed (${note})` : "Fixed"}</span>
			<span className="sm:hidden">Fixed</span>
		</span>
	);
}

function Yes({ note }: { note?: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-md border border-green-500/15 bg-green-500/8 px-2 py-0.5 text-xs font-medium text-green-400">
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
		wrksz: <Fixed note="useServerInsertedHTML" />,
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
		label: "cookie storage (zero-flash SSR)",
		next: <No />,
		wrksz: <Yes note='storage="cookie"' />,
	},
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
		label: "Always follow system preference",
		next: <No />,
		wrksz: <Yes note="followSystem prop" />,
	},
	{
		label: "disableTransitionOnChange per property",
		next: <No />,
		wrksz: <Yes note="CSS string + inline script" />,
	},
	{
		label: "Read theme outside React",
		next: <No />,
		wrksz: <Yes note="getTheme()" />,
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
			<div className="mb-10 text-center">
				<p className="mb-2 text-xs font-semibold text-fd-muted-foreground/40">Comparison</p>
				<h2 className="text-xl font-semibold tracking-tight text-fd-foreground sm:text-2xl">
					Why not next-themes?
				</h2>
				<p className="mt-2 text-sm text-fd-muted-foreground">
					43 open issues, 16 open PRs, React 19 bugs unresolved.
				</p>
			</div>

			<div className="overflow-hidden rounded-xl border border-fd-border sm:hidden">
				{rows.map((row, i) => (
					<div
						key={row.label}
						className={`flex items-center justify-between gap-4 px-4 py-3 ${i < rows.length - 1 ? "border-b border-fd-border" : ""}`}
					>
						<span className="text-xs text-fd-muted-foreground">{row.label}</span>
						{row.wrksz}
					</div>
				))}
			</div>

			<div className="hidden overflow-hidden rounded-xl border border-fd-border sm:block">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-fd-border">
							<th className="px-4 py-2.5 text-left text-xs font-medium text-fd-muted-foreground/50" />
							<th className="px-4 py-2.5 text-center text-xs font-medium text-fd-muted-foreground/50">
								next-themes
							</th>
							<th className="px-4 py-2.5 text-center text-xs font-medium text-fd-muted-foreground/50">
								@wrksz/themes
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row, i) => (
							<tr
								key={row.label}
								className={`transition-colors hover:bg-fd-muted/30 ${i < rows.length - 1 ? "border-b border-fd-border" : ""}`}
							>
								<td className="px-4 py-3 text-xs text-fd-muted-foreground">
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
					className="text-xs text-fd-muted-foreground/50 underline-offset-4 transition-colors hover:text-fd-muted-foreground hover:underline"
				>
					Read the full breakdown
				</Link>
			</div>
		</section>
	);
}
