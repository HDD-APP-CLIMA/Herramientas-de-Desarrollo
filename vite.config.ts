import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Importante: Asegura que los assets y rutas busquen en la sub-ruta del repositorio de GitHub
  base: '/Herramientas-de-Desarrollo/',
  // La clave de OpenWeather está guardada en src/.env en este proyecto.
  envDir: './src',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  }
})