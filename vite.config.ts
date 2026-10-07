import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.jpg'],
      manifest: {
        name: '3列シナリオエディタ',
        short_name: 'シナリオエディタ',
        description: '3列形式のシナリオ・脚本執筆エディタ',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone', // アドレスバーのない全画面表示
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // オフライン動作用のキャッシュ対象
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })],
})

