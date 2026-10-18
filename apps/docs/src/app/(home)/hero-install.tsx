"use client";

import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Popover, PopoverContent, PopoverTrigger } from "fumadocs-ui/components/ui/popover";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { PKG_MANAGERS, usePackageManager, writePm } from "@/components/install-command";
import { cn } from "@/lib/cn";

export function HeroInstall() {
	const pm = usePackageManager();
	const [open, setOpen] = useState(false);
	const command = PKG_MANAGERS.find((mgr) => mgr.label === pm)?.command ?? "";
	const rest = command.slice(pm.length);

	return (
		<div className="flex h-8 w-70 max-w-full items-center gap-1.5 rounded-md bg-fd-card ps-3 pe-0.5 font-mono text-[13px]">
			<span className="select-none text-fd-muted-foreground">$</span>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					aria-label={`Package manager: ${pm}`}
					className="group flex items-center gap-0.5 rounded-sm text-[#693ACF] outline-none focus-visible:ring-2 focus-visible:ring-fd-ring dark:text-[#9D6AFB]"
				>
					{pm}
					<HugeiconsIcon
						icon={ArrowDown01Icon}
						size={12}
						color="currentColor"
						strokeWidth={2}
						className="text-fd-muted-foreground transition-[color,rotate] duration-150 ease-out group-hover:text-fd-foreground group-data-[state=open]:rotate-180 group-data-[state=open]:text-fd-foreground"
					/>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					sideOffset={6}
					className="flex min-w-36 flex-col rounded-xl border-0 bg-fd-popover p-1 font-mono text-[13px] shadow-[0_10px_24px_rgb(0_0_0/0.09),0_2px_8px_rgb(0_0_0/0.06),0_0_0_1px_var(--color-fd-border)] backdrop-blur-none"
				>
					{PKG_MANAGERS.map((mgr) => (
						<button
							key={mgr.label}
							type="button"
							onClick={() => {
								writePm(mgr.label);
								setOpen(false);
							}}
							className={cn(
								"flex items-center justify-between gap-4 rounded-lg px-2.5 py-1.5 text-start outline-none transition-colors duration-150 hover:bg-fd-accent focus-visible:bg-fd-accent",
								pm === mgr.label
									? "text-fd-foreground"
									: "text-fd-muted-foreground",
							)}
						>
							{mgr.label}
							{pm === mgr.label ? (
								<HugeiconsIcon
									icon={Tick02Icon}
									size={13}
									color="currentColor"
									strokeWidth={2}
								/>
							) : null}
						</button>
					))}
				</PopoverContent>
			</Popover>
			<code className="min-w-0 flex-1 truncate text-[#199F43] dark:text-[#5ECC71]">
				{rest.trimStart()}
			</code>
			<CopyButton getValue={() => command} label="Copy command" className="size-7" />
		</div>
	);
}
