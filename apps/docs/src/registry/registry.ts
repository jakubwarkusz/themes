export const REGISTRY_URL = "https://themes.wrksz.dev/r";

const ICONS = `${REGISTRY_URL}/theme-icons.json`;

type RegistryItem = {
	name: string;
	title: string;
	description: string;
	dependencies: string[];
	registryDependencies: string[];
};

export const registryItems = [
	{
		name: "theme-icons",
		title: "Theme icons",
		description: "Sun, moon, system and chevron icons shared by the theme toggles.",
		dependencies: ["@hugeicons/react", "@hugeicons/core-free-icons"],
		registryDependencies: [],
	},
	{
		name: "theme-toggle",
		title: "Theme toggle",
		description: "Icon button that switches between light and dark.",
		dependencies: ["@wrksz/themes"],
		registryDependencies: [ICONS],
	},
	{
		name: "theme-switcher",
		title: "Theme switcher",
		description: "Segmented control for light, system and dark.",
		dependencies: ["@wrksz/themes"],
		registryDependencies: [ICONS],
	},
	{
		name: "theme-select",
		title: "Theme select",
		description: "Native select with light, dark and system options.",
		dependencies: ["@wrksz/themes"],
		registryDependencies: [ICONS],
	},
	{
		name: "theme-cycle",
		title: "Theme cycle",
		description: "Button that cycles light, dark and system with a label.",
		dependencies: ["@wrksz/themes"],
		registryDependencies: [ICONS],
	},
] as const satisfies RegistryItem[];

export type RegistryName = Exclude<(typeof registryItems)[number]["name"], "theme-icons">;
