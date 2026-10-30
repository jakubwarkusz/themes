"use client";

import type { ComponentType } from "react";
import { ThemeCycle } from "@/registry/theme-cycle";
import { ThemeSelect } from "@/registry/theme-select";
import { ThemeSwitcher } from "@/registry/theme-switcher";
import { ThemeToggle } from "@/registry/theme-toggle";
import type { RegistryName } from "@/registry/registry";

const PREVIEWS: Record<RegistryName, ComponentType> = {
	"theme-toggle": ThemeToggle,
	"theme-switcher": ThemeSwitcher,
	"theme-select": ThemeSelect,
	"theme-cycle": ThemeCycle,
};

export function TogglePreview({ name }: { name: RegistryName }) {
	const Preview = PREVIEWS[name];

	return (
		<div className="not-prose my-6 flex min-h-36 items-center justify-center rounded-xl bg-fd-card p-6">
			<Preview />
		</div>
	);
}
