import {defineConfig} from "oxfmt"

export default defineConfig({
  printWidth: 96,
  semi: false,
  bracketSpacing: false,
  sortImports: true,
  sortTailwindcss: {
    stylesheet: "packages/client/src/styles/global.css",
    functions: ["cva", "cn"],
  },
  sortPackageJson: true,
  ignorePatterns: [
    "packages/client/src/routeTree.gen.ts",
    "worker-configuration.d.ts",
    "pnpm-lock.yaml",
  ],
})
