import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the project at /hack-sdgs-portal/.
// We use HashRouter so client-side routing works without server config,
// but assets still need the correct base path.
export default defineConfig({
  plugins: [react()],
  base: '/hack-sdgs-portal/',
})
