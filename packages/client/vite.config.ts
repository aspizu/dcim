import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import {tanstackRouter} from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import {defineConfig} from "vite"

export default defineConfig({
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
        target: "https://dcim.aspiz.uk",
        changeOrigin: true,
      },
    },
  },
})
