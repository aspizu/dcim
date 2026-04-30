import js from "@eslint/js"
import {defineConfig, globalIgnores} from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig([
  globalIgnores(["eslint.config.ts"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
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
