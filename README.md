# Herramientas-de-Desarrollo

Aplicación web para consultar y administrar información meteorológica y pronósticos de distintas ciudades.

## Requisitos

- Node.js 20.6 o posterior y npm.
- Un navegador moderno.

## Ejecución local

Abre una terminal en la carpeta del proyecto:

```bash
cd Herramientas-de-Desarrollo
```

Instala las dependencias de la API y la interfaz:

```bash
npm install express react react-dom react-router-dom react-hook-form vite typescript
```

Crea el archivo `.env` a partir de la plantilla (o edítalo si ya existe):

```bash
cp .env.example .env
```

La configuración predeterminada usa `PORT=3000` para la API, `VITE_API_URL=http://localhost:3000/api` para la interfaz y permite los orígenes `http://localhost:5173` y `http://localhost:5174` mediante CORS. Puedes cambiar el puerto y los orígenes permitidos con `PORT` y `CORS_ORIGINS` en `.env`; esta última acepta una lista separada por comas.

Abre dos terminales desde la carpeta del proyecto. En la primera, inicia la API:

```bash
node --env-file=.env server.js
```

La API estará disponible en `http://localhost:3000`.

En la segunda, inicia la interfaz con Vite:

```bash
npx vite --host 0.0.0.0
```

Abre `http://localhost:5173` en el navegador. Ese origen está incluido en la configuración CORS predeterminada de la API.

La API usa datos en memoria para esta demostración. Las ciudades creadas o modificadas se reinician al detener el servidor.
