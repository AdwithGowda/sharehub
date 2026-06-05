import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Function to read USE_EXTERNAL_DB from backend/.env
let useExternalDb = false;
try {
  const envPath = path.resolve(__dirname, '../backend/.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const match = envContent.match(/USE_EXTERNAL_DB\s*=\s*([^\s]+)/)
    if (match && match[1].trim() === 'True') {
      useExternalDb = true
    }
  }
} catch (e) {
  console.error('Failed to read backend .env', e)
}

const backendUrl = (useExternalDb || process.env.RENDER === 'true')
  ? 'https://sharehub-c57o.onrender.com' 
  : 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BACKEND_URL__: JSON.stringify(backendUrl)
  },
  server: {
    proxy: {
      '/media': {
        target: backendUrl,
        changeOrigin: true,
      }
    }
  }
})
