"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { CopyButton } from "./copy-button";

const PKG_MANAGERS = [
	{ label: "bun", command: "bun add @wrksz/themes" },
	{ label: "npm", command: "npm install @wrksz/themes" },
	{ label: "pnpm", command: "pnpm add @wrksz/themes" },
	{ label: "yarn", command: "yarn add @wrksz/themes" },
] as const;

type PkgManager = (typeof PKG_MANAGERS)[number]["label"];

export function InstallCommand({ className }: { className?: string }) {
	const [pm, setPm] = useState<PkgManager>("pnpm");
	const command = PKG_MANAGERS.find((mgr) => mgr.label === pm)?.command ?? "";
	const active = PKG_MANAGERS.findIndex((mgr) => mgr.label === pm);

	return (
		<div
			className={cn(
				"not-prose flex flex-col gap-1 rounded-xl bg-fd-card p-1.5 sm:flex-row sm:items-center",
				className,
			)}
		>
			<fieldset
				aria-label="Package manager"
				className="relative grid h-8 min-w-0 shrink-0 grid-cols-4 sm:w-48"
			>
				<span
					aria-hidden
					className="absolute inset-y-0 left-0 w-1/4 rounded-md bg-fd-background shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-transform duration-200 ease-out motion-reduce:transition-none dark:bg-fd-secondary"
					style={{ transform: `translateX(${active * 100}%)` }}
				/>
				{PKG_MANAGERS.map((mgr) => (
					<button
						key={mgr.label}
						type="button"
						aria-pressed={pm === mgr.label}
						onClick={() => setPm(mgr.label)}
						className={cn(
							"relative cursor-pointer rounded-md text-xs font-medium outline-none transition-[color,scale] duration-150 focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]",
							pm === mgr.label
								? "text-fd-foreground"
								: "text-fd-muted-foreground hover:text-fd-foreground",
						)}
					>
						{mgr.label}
					</button>
				))}
			</fieldset>
			<div className="flex h-8 min-w-0 flex-1 items-center gap-2 pl-2.5 sm:pl-3">
				<span className="select-none font-mono text-[13px] text-fd-muted-foreground">
					$
				</span>
				<code className="flex-1 truncate text-left font-mono text-[13px] text-fd-foreground">
					{command}
				</code>
				<CopyButton getValue={() => command} label="Copy command" />
			</div>
		</div>
	);
}
