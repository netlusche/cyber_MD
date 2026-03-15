import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // WICHTIG: Setzt alle Asset-Pfade auf relativ (für Einbindung in Unterordner)
})
