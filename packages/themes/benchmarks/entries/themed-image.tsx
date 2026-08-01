import type { ReactElement } from "react";
import { ThemedImage } from "@wrksz/themes/client";

export function ThemedImageFixture(): ReactElement {
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
