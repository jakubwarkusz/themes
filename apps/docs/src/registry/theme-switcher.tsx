"use client";

import { useTheme } from "@wrksz/themes/client";
import { MoonIcon, SunIcon, SystemIcon } from "./theme-icons";

const OPTIONS = [
	{ value: "light", label: "Light", Icon: SunIcon },
	{ value: "system", label: "System", Icon: SystemIcon },
	{ value: "dark", label: "Dark", Icon: MoonIcon },
] as const;

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const index = OPTIONS.findIndex((option) => option.value === theme);

	return (
		<fieldset
			aria-label="Theme"
			className="relative inline-flex rounded-full border border-border bg-background p-0.5"
		>
			<span
				aria-hidden
				className="absolute top-0.5 left-0.5 size-7 rounded-full bg-accent transition-[translate,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
				style={{ translate: `${Math.max(index, 0) * 100}% 0`, opacity: index < 0 ? 0 : 1 }}
			/>
			{OPTIONS.map(({ value, label, Icon }) => (
				<button
					key={value}
					type="button"
					aria-pressed={theme === value}
					aria-label={label}
					title={label}
					onClick={() => setTheme(value)}
					className="relative inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:text-foreground"
				>
					<Icon className="size-3.5" />
				</button>
			))}
		</fieldset>
	);
}
