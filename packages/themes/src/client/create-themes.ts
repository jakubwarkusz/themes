"use client";

import { createThemes as createThemesImplementation } from "../factory/create-themes.js";

export const createThemes: typeof createThemesImplementation = createThemesImplementation;
