import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "takumi-js/response";

export const alt = "@wrksz/themes: drop-in replacement for next-themes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROOT = process.cwd();
const read = (path: string) => readFile(join(ROOT, path));

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				padding: 56,
				backgroundColor: "#141414",
				fontFamily: "Inter",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: 220,
					borderRadius: 28,
					backgroundImage: "url(sky)",
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<img src="sticker" alt="" width={124} height={124} />
			</div>

			<div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
				<div style={{ display: "flex", fontSize: 46, fontWeight: 500, color: "#f2f2f2" }}>
					@wrksz/themes
				</div>
				<div
					style={{
						display: "flex",
						marginTop: 10,
						maxWidth: 940,
						fontSize: 28,
						lineHeight: 1.4,
						color: "#9a9a9a",
					}}
				>
					Drop-in replacement for next-themes. React 19 hydration fixed, full TypeScript
					types, zero dependencies.
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignSelf: "flex-start",
					alignItems: "center",
					gap: 14,
					marginTop: 30,
					padding: "12px 20px",
					borderRadius: 12,
					backgroundColor: "#1d1d1d",
					fontFamily: "Ioskeley Mono",
					fontSize: 24,
				}}
			>
				<span style={{ color: "#7a7a7a" }}>$</span>
				<span style={{ color: "#9D6AFB" }}>pnpm</span>
				<span style={{ color: "#5ECC71" }}>add @wrksz/themes</span>
			</div>
		</div>,
		{
			...size,
			format: "png",
			fonts: [
				{ name: "Inter", data: await read("src/app/fonts/Inter.woff2") },
				{
					name: "Ioskeley Mono",
					data: await read("src/app/fonts/IoskeleyMono-Regular.woff2"),
				},
			],
			images: [
				{ src: "sky", data: () => read("src/assets/home/sky-night.webp") },
				{ src: "sticker", data: () => read("src/assets/home/sticker.png") },
			],
		},
	);
}
