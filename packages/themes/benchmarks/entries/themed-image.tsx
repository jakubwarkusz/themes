import { ThemedImage } from "@wrksz/themes/client";

export function ThemedImageFixture() {
	return (
		<ThemedImage
			src={{
				light: "/logo-light.svg",
				dark: "/logo-dark.svg",
			}}
			alt="Logo"
			width={120}
			height={40}
		/>
	);
}
