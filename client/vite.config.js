import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 4174,
    allowedHosts: ['aiworldtech.org', 'www.aiworldtech.org']
  }
})
