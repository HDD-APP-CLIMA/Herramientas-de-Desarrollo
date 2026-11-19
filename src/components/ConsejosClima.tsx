import type { Consejo } from '../utils/recomendaciones';
import SectionHeading from './SectionHeading';

interface Props {
  recomendaciones: Consejo[];
  precauciones: Consejo[];
}

const etiquetasNivel: Record<Consejo['nivel'], string> = {
  alto: 'Importante',
  medio: 'Atención',
  bajo: 'Consejo',
};

export default function ConsejosClima({ recomendaciones, precauciones }: Props) {
  return (
    <section className="consejos-section" id="consejos">
      <SectionHeading
        eyebrow="ANTES DE SALIR"
        title="Recomendaciones y precauciones"
        note="Consejos personalizados"
      />

      <div className="consejos-grid">
        <article className="consejo-panel panel-recomendaciones">
          <div className="consejo-panel-head">
            <span className="consejo-panel-icon" aria-hidden="true">✅</span>
            <div>
              <h3>Recomendaciones</h3>
              <p>Para que disfrutes el día al máximo</p>
            </div>
          </div>
          <ul className="consejo-list">
            {recomendaciones.map((consejo) => (
              <li key={consejo.texto}>
                <span className="consejo-bullet" aria-hidden="true">{consejo.icono}</span>
                <p>{consejo.texto}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="consejo-panel panel-precauciones">
          <div className="consejo-panel-head">
            <span className="consejo-panel-icon" aria-hidden="true">🛡️</span>
            <div>
              <h3>Precauciones</h3>
              <p>Lo que conviene tener en cuenta</p>
            </div>
          </div>
          <ul className="consejo-list">
            {precauciones.map((consejo) => (
              <li key={consejo.texto}>
                <span className="consejo-bullet" aria-hidden="true">{consejo.icono}</span>
                <p>{consejo.texto}</p>
                <span className={`nivel-badge nivel-${consejo.nivel}`}>
                  {etiquetasNivel[consejo.nivel]}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
