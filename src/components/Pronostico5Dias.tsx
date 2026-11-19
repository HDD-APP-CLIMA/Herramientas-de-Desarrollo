import type { PronosticoDia } from '../models/clima.model';
import { formatearTemperatura } from '../utils/clima';
import SectionHeading from './SectionHeading';

interface Props {
  dias: PronosticoDia[];
  cargando: boolean;
  error: string;
  unidad: string;
  esCelsius: boolean;
}

function fechaCorta(fecha: string): string {
  return new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export default function Pronostico5Dias({ dias, cargando, error, unidad, esCelsius }: Props) {
  const globalMin = dias.length ? Math.min(...dias.map((dia) => dia.tempMin)) : 0;
  const globalMax = dias.length ? Math.max(...dias.map((dia) => dia.tempMax)) : 1;
  const rango = Math.max(1, globalMax - globalMin);

  return (
    <section className="forecast-section" id="pronostico">
      <SectionHeading
        eyebrow="PRÓXIMOS 5 DÍAS"
        title="Pronóstico extendido"
        note={dias.length ? `📅 ${dias.length} días por delante` : undefined}
      />

      {cargando && (
        <div className="forecast-placeholder" role="status">
          <span className="spinner" />
          <p>Cargando el pronóstico de los próximos días...</p>
        </div>
      )}

      {!cargando && error && (
        <div className="forecast-placeholder forecast-warning" role="status">
          <span aria-hidden="true">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {!cargando && !error && dias.length === 0 && (
        <div className="forecast-placeholder">
          <span aria-hidden="true">📭</span>
          <p>No hay pronóstico disponible para esta ciudad.</p>
        </div>
      )}

      {!cargando && !error && dias.length > 0 && (
        <div className="forecast-grid">
          {dias.map((dia, indice) => {
            const tempMax = formatearTemperatura(dia.tempMax, esCelsius);
            const tempMin = formatearTemperatura(dia.tempMin, esCelsius);
            const izquierda = ((dia.tempMin - globalMin) / rango) * 100;
            const ancho = Math.max(8, ((dia.tempMax - dia.tempMin) / rango) * 100);
            return (
              <article
                className="forecast-card"
                key={dia.fecha}
                style={{ animationDelay: `${indice * 70}ms` }}
              >
                <div className="forecast-head">
                  <h3>{dia.etiqueta}</h3>
                  <span>{fechaCorta(dia.fecha)}</span>
                </div>

                <img
                  className="forecast-icon"
                  src={`https://openweathermap.org/img/wn/${dia.icon}@2x.png`}
                  alt={dia.descripcion}
                  loading="lazy"
                />

                <p className="forecast-description">{dia.descripcion}</p>

                <div className="forecast-temps">
                  <strong>{tempMax}{unidad}</strong>
                  <span>{tempMin}{unidad}</span>
                </div>

                <div
                  className="forecast-range"
                  title={`Mínima ${tempMin}${unidad} · Máxima ${tempMax}${unidad}`}
                  aria-hidden="true"
                >
                  <span style={{ left: `${izquierda}%`, width: `${ancho}%` }} />
                </div>

                {dia.probabilidadLluvia > 0 && (
                  <span className="forecast-pop">☂️ {dia.probabilidadLluvia}% lluvia</span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
