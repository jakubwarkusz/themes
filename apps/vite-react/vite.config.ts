import react from "@vitejs/plugin-react";
import { getScript } from "@wrksz/themes/script";
import { defineConfig, type Plugin } from "vite";

const themeBootstrap = getScript({
	storageKey: "theme",
	attribute: "class",
	defaultTheme: "light",
	enableSystem: false,
	enableColorScheme: true,
	forcedTheme: undefined,
	themes: ["light", "dark"],
	value: undefined,
	target: "html",
	storage: "hybrid",
	themeColors: undefined,
	initialTheme: undefined,
	disableTransitionOnChange: false,
	followSystem: false,
});

function themeScriptPlugin(): Plugin {
	return {
		name: "theme-script",
		transformIndexHtml(html) {
			return html.replace(
				"<head>",
				`<head>\n    <script data-theme-bootstrap="true">${themeBootstrap}</script>`,
			);
		},
	};
}

export default defineConfig({
	plugins: [themeScriptPlugin(), react()],
	preview: {
		host: "127.0.0.1",
		port: 3138,
		strictPort: true,
	},
});
