import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  console.info('envs', { VITE_BASE_URL: env.VITE_BASE_URL, VITE_PUBLIC_ENV: env.VITE_PUBLIC_ENV, DEV: env.DEV, NODE_ENV: env.NODE_ENV })
  return {
    base: env.VITE_BASE_URL,
    appType: 'mpa',
    plugins: [
      devtools(),
      tanstackRouter({
        target: 'react',
        routesDirectory: 'routes',
        autoCodeSplitting: true,
      }),
      viteReact(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  }
})
