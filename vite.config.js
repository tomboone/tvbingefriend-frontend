import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Episode service endpoints (most specific first)
      '^/api/episodes/\\d+/\\d+/episodes': {
        target: 'http://localhost:7073',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/episodes\/(\d+)\/(\d+)\/episodes$/, '/api/shows/$1/seasons/$2/episodes')
      },
      // Single episode endpoint
      '^/api/episodes/\\d+$': {
        target: 'http://localhost:7073',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/episodes\/(\d+)$/, '/api/episodes/$1')
      },
      // Season service endpoints
      '^/api/seasons/\\d+/\\d+$': {
        target: 'http://localhost:7072',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seasons\/(\d+)\/(\d+)$/, '/api/shows/$1/seasons/$2')
      },
      '/api/seasons': {
        target: 'http://localhost:7072',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seasons\/(\d+)\/seasons$/, '/api/shows/$1/seasons')
      },
      // Show service endpoints
      '/api/shows': {
        target: 'http://localhost:7071',
        changeOrigin: true
      }
    }
  }
})
