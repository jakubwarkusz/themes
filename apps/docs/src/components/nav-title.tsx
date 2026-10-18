"use client";

import Image from "next/image";
import Link from "next/link";
import { type ComponentProps, createContext, type ReactNode, useContext } from "react";
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

export function VersionLink({ version }: { version?: string }) {
	if (!version) return null;
	return (
		<Link
			href="/docs/changelog"
			aria-label={`Version ${version}, view changelog`}
			className="rounded-sm font-mono text-xs font-normal text-fd-muted-foreground outline-none transition-colors duration-150 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring"
		>
			v{version}
			{version.includes("beta") ? " · beta" : null}
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
