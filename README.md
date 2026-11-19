# Herramientas-de-Desarrollo
# 🌤️ App de Clima

Una aplicación web intuitiva y minimalista que permite a los usuarios consultar el pronóstico del tiempo actual de cualquier ciudad del mundo. 

## 🚀 Características
* Búsqueda de clima en tiempo real por ciudad.
* Interfaz amigable y adaptable a dispositivos móviles (Responsive Design).
* Detalles dinámicos del clima: humedad, sensación térmica, viento con dirección,
  presión, visibilidad, nubosidad, rango de temperatura y ciclo solar.
* Sugerencias de qué hacer hoy según las condiciones (actividades al aire libre
  o en interiores).
* Recomendaciones y precauciones personalizadas según temperatura, humedad,
  viento, lluvia y visibilidad.
* Pronóstico de los próximos 5 días con máximas, mínimas e índice de lluvia.
* Cambio entre grados Celsius y Fahrenheit en toda la interfaz.

## 🛠️ Tecnologías utilizadas
* HTML5, CSS3, JavaScript (o reemplaza con tu stack, ej: React, Node.js)
* Consumo de API REST (ej. OpenWeatherMap)

## 💻 Cómo ejecutar el proyecto localmente

1. Crea un archivo `.env` a partir de `.env.example`:
   ```bash
   copy .env.example .env
   ```
2. Añade tu clave de OpenWeather en `.env`:
   ```text
   VITE_OPENWEATHER_API_KEY=tu_clave_real
   ```
3. Reinicia el servidor de desarrollo después de cambiar el archivo:
   ```bash
   npm run dev
   ```

Sigue estos pasos para ejecutar una copia local en tu computadora:

1. **Clona el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)