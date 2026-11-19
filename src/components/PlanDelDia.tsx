import type { TemaClima } from '../utils/clima';
import type { Actividad, ResumenDia } from '../utils/recomendaciones';
import SectionHeading from './SectionHeading';

interface Props {
  resumen: ResumenDia;
  actividades: Actividad[];
  tema: TemaClima;
}

export default function PlanDelDia({ resumen, actividades, tema }: Props) {
  return (
    <section className="plan-section" id="plan">
      <SectionHeading
        eyebrow="TU PLAN PARA HOY"
        title="¿Qué hacer hoy?"
        note="Ideas según el clima"
      />

      <div className={`plan-highlight theme-${tema}`}>
        <span className="plan-highlight-emoji" aria-hidden="true">{resumen.emoji}</span>
        <div>
          <h3>{resumen.titulo}</h3>
          <p>{resumen.texto}</p>
        </div>
      </div>

      <div className="activity-grid">
        {actividades.map((actividad, indice) => (
          <article
            className="activity-card"
            key={actividad.titulo}
            style={{ animationDelay: `${indice * 60}ms` }}
          >
            <span className="activity-icon" aria-hidden="true">{actividad.icono}</span>
            <h3>{actividad.titulo}</h3>
            <p>{actividad.detalle}</p>
            <span className="activity-tag">{actividad.categoria}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
