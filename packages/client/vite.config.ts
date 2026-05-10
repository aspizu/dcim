import {cloudflare} from "@cloudflare/vite-plugin"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import {tanstackRouter} from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import {defineConfig, loadEnv} from "vite"


// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      cloudflare(),
      babel({
        plugins: [["module:@preact/signals-react-transform"]],
      }),
      tailwindcss(),
    ],
    server: {
      proxy: {
        "/api": {
          target: `http://dcim.${env.VITE_USERNAME}.workers.dev`,
          changeOrigin: true,
        },
      },
    },
  }
})
