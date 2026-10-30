"use client";

import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { CopyIcons, useCopied } from "./copy-button";
import { PM_LOGOS } from "./pm-logos";

export const PKG_MANAGERS = [
	{ label: "bun", command: "bun add @wrksz/themes" },
	{ label: "npm", command: "npm install @wrksz/themes" },
	{ label: "pnpm", command: "pnpm add @wrksz/themes" },
	{ label: "yarn", command: "yarn add @wrksz/themes" },
] as const;

export type PkgManager = (typeof PKG_MANAGERS)[number]["label"];

const DLX: Record<PkgManager, string> = {
	bun: "bunx --bun",
	npm: "npx",
	pnpm: "pnpm dlx",
	yarn: "yarn dlx",
};

const STORAGE_KEY = "wrksz-themes:package-manager";
const DEFAULT_PM: PkgManager = "pnpm";
const listeners = new Set<() => void>();
let memory: PkgManager = DEFAULT_PM;

function isPkgManager(value: string | null): value is PkgManager {
	return PKG_MANAGERS.some((mgr) => mgr.label === value);
}

function readPm(): PkgManager {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return isPkgManager(stored) ? stored : memory;
	} catch {
		return memory;
	}
}

export function writePm(pm: PkgManager) {
	memory = pm;
	try {
		localStorage.setItem(STORAGE_KEY, pm);
	} catch {}
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key === STORAGE_KEY) listener();
	};
	listeners.add(listener);
	window.addEventListener("storage", onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

export function usePackageManager() {
	return useSyncExternalStore(subscribe, readPm, () => DEFAULT_PM);
}

export function InstallCommand({ registry, className }: { registry?: string; className?: string }) {
	const pm = usePackageManager();
	const [picked, setPicked] = useState(false);
	const command = registry
		? `${DLX[pm]} shadcn@latest add ${registry}`
		: (PKG_MANAGERS.find((mgr) => mgr.label === pm)?.command ?? "");
	const runner = registry ? DLX[pm] : pm;
	const active = PKG_MANAGERS.findIndex((mgr) => mgr.label === pm);
	const [copied, copy] = useCopied(() => navigator.clipboard.writeText(command));

	return (
		<figure className={cn("not-prose my-6 rounded-xl bg-fd-card p-1.5", className)}>
			<fieldset
				aria-label="Package manager"
				className="relative grid h-8 w-full grid-cols-4 sm:w-80"
			>
				<span
					aria-hidden
					className={cn(
						"absolute inset-y-0 left-0 w-1/4 rounded-md bg-fd-background shadow-[0_1px_2px_rgb(0_0_0/0.08)] motion-reduce:transition-none dark:bg-fd-secondary",
						picked && "transition-transform duration-200 ease-out",
					)}
					style={{ transform: `translateX(${active * 100}%)` }}
				/>
				{PKG_MANAGERS.map((mgr) => {
					const Logo = PM_LOGOS[mgr.label];
					const selected = pm === mgr.label;
					return (
						<button
							key={mgr.label}
							type="button"
							aria-pressed={selected}
							onClick={() => {
								setPicked(true);
								writePm(mgr.label);
							}}
							className={cn(
								"group relative flex items-center justify-center gap-1.5 rounded-md text-xs font-medium outline-none transition-[color,scale] duration-150 focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]",
								selected
									? "text-fd-foreground"
									: "text-fd-muted-foreground hover:text-fd-foreground",
							)}
						>
							<Logo
								className={cn(
									"size-3.5 shrink-0 transition-[opacity,filter] duration-150",
									!selected &&
										"opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0",
								)}
							/>
							{mgr.label}
						</button>
					);
				})}
			</fieldset>
			<div className="relative mt-1.5 flex h-10 items-center gap-1.5 ps-3 pe-1 font-mono text-[13px]">
				<button
					type="button"
					tabIndex={-1}
					aria-hidden
					onClick={copy}
					className="absolute inset-0 rounded-md outline-none"
				/>
				<span className="select-none text-fd-muted-foreground">$</span>
				<code className="min-w-0 flex-1 truncate">
					<span className="text-[#693ACF] dark:text-[#9D6AFB]">{runner}</span>
					<span className="text-[#199F43] dark:text-[#5ECC71]">
						{command.slice(runner.length)}
					</span>
				</code>
				<button
					type="button"
					onClick={copy}
					aria-label={copied ? "Copied" : "Copy command"}
					className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground outline-none transition-[color,background-color] duration-150 ease-out hover:bg-fd-accent hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring"
				>
					<CopyIcons
						copied={copied}
						className="transition-[scale] duration-150 ease-out [button:active>&]:scale-[0.96]"
					/>
				</button>
			</div>
		</figure>
	);
}
