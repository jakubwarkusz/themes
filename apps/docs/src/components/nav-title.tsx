"use client";

import Image from "next/image";
import Link from "next/link";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useSyncExternalStore,
} from "react";
import { cn } from "@/lib/cn";

const VersionContext = createContext<string | undefined>(undefined);

export function VersionProvider({ version, children }: { version?: string; children: ReactNode }) {
	return <VersionContext value={version}>{children}</VersionContext>;
}

export function Brand() {
	return (
		<span className="flex items-center gap-1.5">
			<Image
				src="/wrksz.svg"
				alt="@wrksz"
				width={28}
				height={16}
				className="invert dark:invert-0"
			/>
			<span className="text-fd-muted-foreground">/</span>
			<span className="font-medium">themes</span>
		</span>
	);
}

const SEEN_KEY = "wrksz-docs-seen-version";
const seenListeners = new Set<() => void>();

function readSeen() {
	try {
		return localStorage.getItem(SEEN_KEY);
	} catch {
		return null;
	}
}

function writeSeen(version: string) {
	try {
		localStorage.setItem(SEEN_KEY, version);
	} catch {}
	for (const listener of seenListeners) listener();
}

function subscribeSeen(listener: () => void) {
	seenListeners.add(listener);
	window.addEventListener("storage", listener);
	return () => {
		seenListeners.delete(listener);
		window.removeEventListener("storage", listener);
	};
}

export function VersionLink({ version }: { version?: string }) {
	const seen = useSyncExternalStore(subscribeSeen, readSeen, () => undefined);

	useEffect(() => {
		if (version && seen === null) writeSeen(version);
	}, [version, seen]);

	if (!version) return null;
	const fresh = typeof seen === "string" && seen !== version;

	return (
		<Link
			href="/docs/changelog"
			onClick={() => writeSeen(version)}
			aria-label={`Version ${version}${fresh ? ", new release" : ""}, view changelog`}
			className="relative rounded-sm font-mono text-xs font-normal text-fd-muted-foreground outline-none transition-colors duration-150 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring"
		>
			v{version}
			{version.includes("beta") ? " · beta" : null}
			{fresh ? (
				<span
					aria-hidden
					className="absolute -top-0.5 -right-1.5 size-1.5 rounded-full bg-(--tone-success) motion-safe:animate-[feedback-in_200ms_ease-out]"
				/>
			) : null}
		</Link>
	);
}

export function NavTitleSlot({ className }: ComponentProps<"a">) {
	const version = useContext(VersionContext);
	return (
		<span className={cn(className, "gap-2")}>
			<Link
				href="/"
				className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
			>
				<Brand />
			</Link>
			<VersionLink version={version} />
		</span>
	);
}
