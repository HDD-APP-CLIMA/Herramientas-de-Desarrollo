# Tempus - App de Clima en Tiempo Real

Aplicación web de clima desarrollada con **React + TypeScript + Vite** en el frontend y **Node.js + Express** en el backend.

## Características
- Visualización de ciudades y datos meteorológicos desde la API local.
- Panel de alertas meteorológicas según condiciones de cada ciudad.
- CRUD de ciudades mediante API REST (`/api/ciudades`).
- **Tiempo real con Socket.IO:** cuando se crea, actualiza o elimina una ciudad, los cambios y alertas se reflejan al instante en los clientes conectados.

## Requisitos
- Node.js 18+ (recomendado)
- npm

## Instalación
```bash
npm.cmd install
```

## Ejecución en desarrollo
En dos terminales separadas:

1. **Backend (API + Socket.IO)**
   ```bash
   npm.cmd run server
   ```
   Disponible en `http://localhost:3000`.

2. **Frontend (Vite)**
   ```bash
   npm.cmd run dev
   ```
   Abre la URL que muestre la terminal (por defecto `http://localhost:5173`).

## Scripts disponibles
- `npm run dev`: inicia el frontend en modo desarrollo.
- `npm run build`: genera la build de producción del frontend.
- `npm run preview`: previsualiza la build de producción.
- `npm run server`: inicia el backend Express con Socket.IO.

## Estructura general
- `server.js`: API REST y servidor Socket.IO.
- `src/`: aplicación frontend (componentes, hooks, modelos y utilidades).
- `hooks/`, `components/`, `models/`: módulos adicionales de la aplicación.

## Notas
- El backend usa datos en memoria (se reinician al reiniciar el servidor).
- Para probar el tiempo real, abre la aplicación en dos ventanas/navegadores y realiza cambios en las ciudades.
