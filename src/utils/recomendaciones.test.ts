import { describe, expect, test } from 'vitest';
import type { WeatherData } from '../models/clima.model';
import { generarConsejos } from './recomendaciones';

function climaBase(cambios: Partial<WeatherData> = {}): WeatherData {
  return {
    name: 'Lima',
    sys: { country: 'PE' },
    main: {
      temp: 22,
      feels_like: 22,
      humidity: 60,
      pressure: 1013,
      temp_min: 18,
      temp_max: 26,
    },
    wind: { speed: 3 },
    weather: [{ main: 'Clear', description: 'cielo despejado', icon: '01d' }],
    ...cambios,
  };
}

describe('generarConsejos', () => {
  test('genera planes de interiores y recomienda paraguas cuando llueve', () => {
    const consejos = generarConsejos(
      climaBase({ weather: [{ main: 'Rain', description: 'lluvia moderada', icon: '10d' }] })
    );

    expect(consejos.actividades.length).toBeGreaterThanOrEqual(3);
    expect(consejos.actividades.some((a) => a.categoria === 'En interiores')).toBe(true);
    expect(consejos.recomendaciones.some((r) => r.texto.includes('paraguas'))).toBe(true);
    expect(consejos.precauciones.length).toBeGreaterThanOrEqual(2);
  });

  test('eleva la precaución ante calor extremo', () => {
    const consejos = generarConsejos(
      climaBase({
        main: {
          temp: 38,
          feels_like: 41,
          humidity: 80,
          pressure: 1010,
        },
      })
    );

    expect(consejos.recomendaciones.some((r) => r.texto.includes('Hidrátate'))).toBe(true);
    expect(consejos.precauciones.some((p) => p.nivel === 'alto')).toBe(true);
    expect(consejos.resumen.titulo).toContain('hidrátate');
  });

  test('recomienda refugio durante una tormenta', () => {
    const consejos = generarConsejos(
      climaBase({ weather: [{ main: 'Thunderstorm', description: 'tormenta', icon: '11d' }] })
    );

    expect(consejos.precauciones.some((p) => p.texto.includes('refugio'))).toBe(true);
    expect(consejos.resumen.titulo).toContain('casa');
  });

  test('siempre devuelve contenido útil con clima templado', () => {
    const consejos = generarConsejos(climaBase());

    expect(consejos.actividades.length).toBeGreaterThanOrEqual(3);
    expect(consejos.recomendaciones.length).toBeGreaterThanOrEqual(2);
    expect(consejos.precauciones.length).toBeGreaterThanOrEqual(1);
  });
});
