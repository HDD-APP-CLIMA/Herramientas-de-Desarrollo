import type {
  PronosticoDia,
  PronosticoResponse,
  WeatherData,
} from '../models/clima.model';

export type TemaClima =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'foggy'
  | 'windy'
  | 'default';

export function obtenerCondicion(datos: WeatherData): string {
  return datos.weather[0]?.main?.toLowerCase() ?? '';
}

export function obtenerTema(condicion: string): TemaClima {
  condicion = condicion.toLowerCase();
  if (condicion.includes('thunder')) return 'rainy';
  if (condicion.includes('rain') || condicion.includes('drizzle')) return 'rainy';
  if (condicion.includes('snow')) return 'snowy';
  if (condicion.includes('mist') || condicion.includes('fog') || condicion.includes('haze')) {
    return 'foggy';
  }
  if (condicion.includes('wind')) return 'windy';
  if (condicion.includes('cloud')) return 'cloudy';
  if (condicion.includes('clear') || condicion.includes('sun')) return 'sunny';
  return 'default';
}

export function obtenerEmoji(condicion: string): string {
  condicion = condicion.toLowerCase();
  if (condicion.includes('thunder')) return '⛈️';
  if (condicion.includes('rain') || condicion.includes('drizzle')) return '🌧️';
  if (condicion.includes('snow')) return '❄️';
  if (condicion.includes('mist') || condicion.includes('fog')) return '🌫️';
  if (condicion.includes('wind')) return '💨';
  if (condicion.includes('cloud')) return '🌥️';
  if (condicion.includes('clear') || condicion.includes('sun')) return '☀️';
  return '🌤️';
}

export function formatearTemperatura(temp: number, esCelsius: boolean): number {
  return Math.round(esCelsius ? temp : (temp * 9) / 5 + 32);
}

export function simboloUnidad(esCelsius: boolean): string {
  return esCelsius ? '°C' : '°F';
}

/** Convierte grados de dirección del viento a los 8 puntos cardinales en español. */
export function direccionViento(grados?: number): string {
  if (grados === undefined || Number.isNaN(grados)) return '';
  const puntos = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const normalizados = ((grados % 360) + 360) % 360;
  return puntos[Math.round(normalizados / 45) % 8];
}

/** Hora local de la ciudad consultada (el timestamp de la API es UTC). */
export function horaLocal(timestamp: number | undefined, timezone = 0): string {
  if (timestamp === undefined) return '--:--';
  return new Date((timestamp + timezone) * 1000).toISOString().slice(11, 16);
}

export function duracionDia(sunrise?: number, sunset?: number): string {
  if (sunrise === undefined || sunset === undefined) return '--';
  const minutos = Math.max(0, Math.round((sunset - sunrise) / 60));
  const horas = Math.floor(minutos / 60);
  const reste = minutos % 60;
  return `${horas} h ${reste.toString().padStart(2, '0')} min`;
}

export function fechaLocalClima(datos: WeatherData): string {
  const timezone = datos.timezone ?? 0;
  const timestamp = datos.dt ?? Math.floor(Date.now() / 1000);
  return new Date((timestamp + timezone) * 1000).toISOString().slice(0, 10);
}

export function categoriaHumedad(humedad: number): string {
  if (humedad >= 80) return 'Muy húmedo';
  if (humedad >= 60) return 'Húmedo';
  if (humedad >= 35) return 'Agradable';
  return 'Seco';
}

export function categoriaViento(velocidad: number): string {
  if (velocidad >= 10) return 'Muy fuerte';
  if (velocidad >= 6) return 'Fuerte';
  if (velocidad >= 3) return 'Moderado';
  return 'Suave';
}

export function categoriaPresion(presion: number): string {
  if (presion >= 1025) return 'Alta';
  if (presion <= 1005) return 'Baja';
  return 'Normal';
}

export function categoriaVisibilidad(visibilidad?: number): string {
  if (visibilidad === undefined) return 'Sin dato';
  if (visibilidad >= 10) return 'Excelente';
  if (visibilidad >= 5) return 'Buena';
  if (visibilidad >= 2) return 'Reducida';
  return 'Muy reducida';
}

export function categoriaNubosidad(nubosidad: number): string {
  if (nubosidad >= 80) return 'Muy cubierto';
  if (nubosidad >= 50) return 'Nublado';
  if (nubosidad >= 20) return 'Parcialmente nublado';
  return 'Despejado';
}

export function categoriaUvi(uvi: number): string {
  if (uvi >= 11) return 'Extremo';
  if (uvi >= 8) return 'Muy alto';
  if (uvi >= 6) return 'Alto';
  if (uvi >= 3) return 'Moderado';
  return 'Bajo';
}

/**
 * Agrupa los bloques de 3 horas del pronóstico en 5 días futuros.
 * El día de hoy se descarta: se muestran los 5 días siguientes.
 */
export function agruparPronostico(
  respuesta: PronosticoResponse | null,
  fechaActual: string
): PronosticoDia[] {
  if (!respuesta?.list?.length) return [];

  const porFecha = new Map<
    string,
    Array<NonNullable<PronosticoResponse['list']>[number]>
  >();

  for (const bloque of respuesta.list) {
    const fecha = bloque.dt_txt?.slice(0, 10);
    if (!fecha || fecha <= fechaActual) continue;
    const grupo = porFecha.get(fecha) ?? [];
    grupo.push(bloque);
    porFecha.set(fecha, grupo);
  }

  const fechas = Array.from(porFecha.keys()).sort().slice(0, 5);

  return fechas.map((fecha, indice) => {
    const grupo = porFecha.get(fecha)!;
    const horaDe = (bloque: (typeof grupo)[number]) =>
      Number(bloque.dt_txt.slice(11, 13));
    const mediodia = grupo.reduce((mejor, bloque) =>
      Math.abs(horaDe(bloque) - 12) < Math.abs(horaDe(mejor) - 12)
        ? bloque
        : mejor
    );

    const nombreDia = new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-ES', {
      weekday: 'short',
      timeZone: 'UTC',
    });
    const etiqueta =
      indice === 0
        ? 'Mañana'
        : nombreDia.charAt(0).toUpperCase() + nombreDia.replace('.', '').slice(1);

    return {
      fecha,
      etiqueta,
      tempMax: Math.round(
        Math.max(...grupo.map((bloque) => bloque.main.temp_max ?? bloque.main.temp))
      ),
      tempMin: Math.round(
        Math.min(...grupo.map((bloque) => bloque.main.temp_min ?? bloque.main.temp))
      ),
      descripcion: mediodia.weather[0]?.description ?? 'Condiciones variables',
      icon: mediodia.weather[0]?.icon ?? '01d',
      probabilidadLluvia: Math.round(
        Math.max(...grupo.map((bloque) => (bloque.pop ?? 0) * 100))
      ),
    };
  });
}
