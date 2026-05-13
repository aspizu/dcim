import {defineConfig} from "oxlint"

export default defineConfig({
  jsPlugins: ["oxlint-plugin-aspizuism"],
  rules: {
    "typescript/consistent-type-imports": [
      "error",
      {fixStyle: "separate-type-imports", prefer: "type-imports"},
    ],
    "typescript/no-deprecated": "error",
    "typescript/no-floating-promises": "error",
    "typescript/await-thenable": "error",
    "typescript/no-misused-promises": "error",
    "aspizuism/block-style": "error",
    "aspizuism/func-style": "error",
    "aspizuism/no-comments": "error",
    "aspizuism/private-prefix": "error",
    "max-lines": ["error", {max: 256}],
  },
  options: {typeAware: true},
})
