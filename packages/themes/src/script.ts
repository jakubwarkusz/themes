import { getScript as getScriptImplementation } from "./core/script.js";
import { ThemeScript as ThemeScriptImplementation } from "./theme-script.js";

export type { ScriptConfig } from "./core/script.js";
export type { ThemeScriptProps } from "./theme-script.js";

export const getScript: typeof getScriptImplementation = getScriptImplementation;
export const ThemeScript: typeof ThemeScriptImplementation = ThemeScriptImplementation;
