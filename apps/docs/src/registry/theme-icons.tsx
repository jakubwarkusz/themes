import { ArrowDown01Icon, ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type IconProps = { className?: string };

export function SunIcon({ className }: IconProps) {
	return (
		<HugeiconsIcon
			icon={Sun03Icon}
			color="currentColor"
			strokeWidth={1.8}
			aria-hidden
			className={className}
		/>
	);
}

export function MoonIcon({ className }: IconProps) {
	return (
		<HugeiconsIcon
			icon={Moon02Icon}
			color="currentColor"
			strokeWidth={1.8}
			aria-hidden
			className={className}
		/>
	);
}

export function SystemIcon({ className }: IconProps) {
	return (
		<HugeiconsIcon
			icon={ComputerIcon}
			color="currentColor"
			strokeWidth={1.8}
			aria-hidden
			className={className}
		/>
	);
}

export function ChevronDownIcon({ className }: IconProps) {
	return (
		<HugeiconsIcon
			icon={ArrowDown01Icon}
			color="currentColor"
			strokeWidth={2}
			aria-hidden
			className={className}
		/>
	);
}
