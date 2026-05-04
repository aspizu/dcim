import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import {defineConfig, globalIgnores} from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {fixStyle: "separate-type-imports", prefer: "type-imports"},
      ],
      "@typescript-eslint/no-deprecated": "error",
      "max-lines": ["error", 128],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error", // Prevents awaiting things that aren't promises
      "@typescript-eslint/no-misused-promises": "error", // Prevents passing promises to places that expect sync functions
    },
  },
])
