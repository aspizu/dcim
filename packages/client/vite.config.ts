import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import {tanstackRouter} from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import {defineConfig, loadEnv} from "vite"

export default defineConfig(({mode}) => {
  const _env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      babel({
        plugins: [["module:@preact/signals-react-transform"]],
      }),
      tailwindcss(),
    ],
    server: {
      proxy: {
        "/api": {
          target: `https://dcim.aspiz.uk`,
          changeOrigin: true,
        },
      },
    },
  }
})
