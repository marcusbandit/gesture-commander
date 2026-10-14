import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Use HTTP for development to avoid SSL issues
    // Camera access will still work on localhost
    https: false
  }
})
