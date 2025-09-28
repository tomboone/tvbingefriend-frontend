import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Episode service endpoints (most specific first)
        '^/api/shows/\\d+/seasons/\\d+/episodes': {
          target: env.VITE_EPISODE_SERVICE_URL || 'http://localhost:7073',
          changeOrigin: true
        },
        '^/api/episodes/\\d+/\\d+/episodes': {
          target: env.VITE_EPISODE_SERVICE_URL || 'http://localhost:7073',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/episodes\/(\d+)\/(\d+)\/episodes$/, '/api/shows/$1/seasons/$2/episodes')
        },
        // Single episode endpoint
        '^/api/episodes/\\d+$': {
          target: env.VITE_EPISODE_SERVICE_URL || 'http://localhost:7073',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/episodes\/(\d+)$/, '/api/episodes/$1')
        },
        // Season service endpoints (most specific first)
        '^/api/shows/\\d+/seasons/\\d+$': {
          target: env.VITE_SEASON_SERVICE_URL || 'http://localhost:7072',
          changeOrigin: true
        },
        '^/api/shows/\\d+/seasons$': {
          target: env.VITE_SEASON_SERVICE_URL || 'http://localhost:7072',
          changeOrigin: true
        },
        '^/api/seasons/\\d+/\\d+$': {
          target: env.VITE_SEASON_SERVICE_URL || 'http://localhost:7072',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/seasons\/(\d+)\/(\d+)$/, '/api/shows/$1/seasons/$2')
        },
        '/api/seasons': {
          target: env.VITE_SEASON_SERVICE_URL || 'http://localhost:7072',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/seasons\/(\d+)\/seasons$/, '/api/shows/$1/seasons')
        },
        // Show service endpoints
        '/api/shows': {
          target: env.VITE_SHOW_SERVICE_URL || 'http://localhost:7071',
          changeOrigin: true
        }
      }
    }
  }
})
