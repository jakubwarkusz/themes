import { createMDX } from "fumadocs-mdx/next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	serverExternalPackages: ["@takumi-rs/image-response"],
	reactStrictMode: true,
	turbopack: {
		resolveAlias: {
			"next-themes": "./src/lib/next-themes-compat.ts",
		},
	},
	webpack(config) {
		config.resolve.alias["next-themes"] = path.resolve(
			__dirname,
			"./src/lib/next-themes-compat.ts",
		);
		return config;
	},
	async rewrites() {
		return [
			{
				source: "/docs/:path*.mdx",
				destination: "/llms.mdx/docs/:path*",
			},
		];
	},
};

export default withMDX(config);
