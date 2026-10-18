import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "@wrksz/themes",
		short_name: "themes",
		description: "Drop-in replacement for next-themes.",
		start_url: "/",
		display: "browser",
		icons: [
			{ src: "/icon.png", sizes: "512x512", type: "image/png" },
			{ src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
		],
	};
}
