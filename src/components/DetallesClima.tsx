import type { WeatherData } from '../models/clima.model';
import {
  categoriaHumedad,
  categoriaNubosidad,
  categoriaPresion,
  categoriaUvi,
  categoriaViento,
  categoriaVisibilidad,
  direccionViento,
  duracionDia,
  formatearTemperatura,
  horaLocal,
  simboloUnidad,
} from '../utils/clima';
import SectionHeading from './SectionHeading';

interface Props {
  datos: WeatherData;
  esCelsius: boolean;
}

interface TarjetaDetalle {
  clave: string;
  icono: string;
  etiqueta: string;
  valor: string;
  unidad?: string;
  descripcion: string;
  categoria: string;
  progreso?: number;
  variante: string;
}

export default function DetallesClima({ datos, esCelsius }: Props) {
  const unidad = simboloUnidad(esCelsius);
  const temp = formatearTemperatura(datos.main.temp, esCelsius);
  const sensacion = formatearTemperatura(datos.main.feels_like, esCelsius);
  const min = datos.main.temp_min !== undefined
    ? formatearTemperatura(datos.main.temp_min, esCelsius)
    : undefined;
  const max = datos.main.temp_max !== undefined
    ? formatearTemperatura(datos.main.temp_max, esCelsius)
    : undefined;

  const direccion = direccionViento(datos.wind.deg);
  const rafaga = datos.wind.gust !== undefined
    ? `${datos.wind.gust.toFixed(1)} m/s`
    : null;
  // La API entrega la visibilidad en metros.
  const visibilidadKm = datos.visibility !== undefined
    ? datos.visibility / 1000
    : undefined;
  const visibilidadTexto = visibilidadKm === undefined
    ? '--'
    : visibilidadKm % 1 === 0
      ? String(visibilidadKm)
      : visibilidadKm.toFixed(1);

  const tarjetas: TarjetaDetalle[] = [
    {
      clave: 'humedad',
      icono: '💧',
      etiqueta: 'Humedad',
      valor: String(datos.main.humidity),
      unidad: '%',
      descripcion: 'Humedad relativa del ambiente',
      categoria: categoriaHumedad(datos.main.humidity),
      progreso: datos.main.humidity,
      variante: 'humidity-card',
    },
    {
      clave: 'sensacion',
      icono: '🌡️',
      etiqueta: 'Sensación térmica',
      valor: String(sensacion),
      unidad,
      descripcion: `Temperatura real: ${temp}${unidad}`,
      categoria: datos.main.feels_like > datos.main.temp
        ? 'Se siente más cálido'
        : datos.main.feels_like < datos.main.temp
          ? 'Se siente más frío'
          : 'Igual que la real',
      variante: 'feels-card',
    },
    {
      clave: 'viento',
      icono: '💨',
      etiqueta: 'Velocidad del viento',
      valor: datos.wind.speed.toFixed(1),
      unidad: ' m/s',
      descripcion: [direccion && `Dirección ${direccion}`, rafaga && `Ráfagas ${rafaga}`]
        .filter(Boolean)
        .join(' · ') || 'Velocidad actual del viento',
      categoria: categoriaViento(datos.wind.speed),
      progreso: Math.min(100, Math.round((datos.wind.speed / 20) * 100)),
      variante: 'wind-card',
    },
    {
      clave: 'presion',
      icono: '◉',
      etiqueta: 'Presión atmosférica',
      valor: String(datos.main.pressure),
      unidad: ' hPa',
      descripcion: 'Presión a nivel local',
      categoria: categoriaPresion(datos.main.pressure),
      variante: 'pressure-card',
    },
    {
      clave: 'visibilidad',
      icono: '👁️',
      etiqueta: 'Visibilidad',
      valor: visibilidadTexto,
      unidad: ' km',
      descripcion: 'Distancia máxima visible',
      categoria: categoriaVisibilidad(visibilidadKm),
      variante: 'visibility-card',
    },
    {
      clave: 'nubosidad',
      icono: '☁️',
      etiqueta: 'Nubosidad',
      valor: String(datos.clouds?.all ?? 0),
      unidad: '%',
      descripcion: 'Porcentaje de cielo cubierto',
      categoria: categoriaNubosidad(datos.clouds?.all ?? 0),
      progreso: datos.clouds?.all ?? 0,
      variante: 'cloud-card',
    },
  ];

  if (min !== undefined && max !== undefined) {
    tarjetas.push({
      clave: 'rango',
      icono: '↕️',
      etiqueta: 'Rango de temperatura',
      valor: `${max}${unidad}`,
      descripcion: `Mínima ${min}${unidad} · Máxima ${max}${unidad}`,
      categoria: `Ahora ${temp}${unidad}`,
      progreso: max > min
        ? Math.max(0, Math.min(100, Math.round(((datos.main.temp - min) / (max - min)) * 100)))
        : 50,
      variante: 'range-card',
    });
  }

  tarjetas.push({
    clave: 'sol',
    icono: '🌅',
    etiqueta: 'Amanecer y atardecer',
    valor: horaLocal(datos.sys.sunrise, datos.timezone),
    descripcion: `Atardecer ${horaLocal(datos.sys.sunset, datos.timezone)} · ${duracionDia(datos.sys.sunrise, datos.sys.sunset)} de luz`,
    categoria: 'Ciclo solar',
    variante: 'sun-card',
  });

  if (datos.uvi !== undefined) {
    tarjetas.push({
      clave: 'uv',
      icono: '🔆',
      etiqueta: 'Índice UV',
      valor: datos.uvi.toFixed(1),
      descripcion: 'Radiación ultravioleta actual',
      categoria: categoriaUvi(datos.uvi),
      progreso: Math.min(100, Math.round((datos.uvi / 11) * 100)),
      variante: 'uv-card',
    });
  }

  return (
    <section className="stats-section" id="estadisticas">
      <SectionHeading
        eyebrow="DATOS EN TIEMPO ACTUAL"
        title="Detalles del clima"
        note={`📍 ${datos.name}`}
      />
      <div className="stats-grid details-grid">
        {tarjetas.map((tarjeta, indice) => (
          <article
            className={`stat-card detail-card ${tarjeta.variante}`}
            key={tarjeta.clave}
            style={{ animationDelay: `${indice * 45}ms` }}
          >
            <div className="stat-top">
              <span className="stat-icon">{tarjeta.icono}</span>
              <span className="stat-label">{tarjeta.etiqueta}</span>
            </div>
            <span className="detail-badge">{tarjeta.categoria}</span>
            <p className="stat-value">
              {tarjeta.valor}
              {tarjeta.unidad && <span>{tarjeta.unidad}</span>}
            </p>
            <p className="stat-description">{tarjeta.descripcion}</p>
            {tarjeta.progreso !== undefined && (
              <div className="stat-progress" aria-hidden="true">
                <span style={{ width: `${tarjeta.progreso}%` }} />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
