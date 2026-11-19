import { describe, expect, test } from 'vitest';
import {
  agruparPronostico,
  direccionViento,
  formatearTemperatura,
  obtenerTema,
} from './clima';
import type { PronosticoResponse } from '../models/clima.model';

describe('utilidades del clima', () => {
  test('convierte temperaturas y direcciones', () => {
    expect(formatearTemperatura(0, false)).toBe(32);
    expect(formatearTemperatura(25, true)).toBe(25);
    expect(direccionViento(0)).toBe('N');
    expect(direccionViento(90)).toBe('E');
    expect(direccionViento(180)).toBe('S');
    expect(direccionViento(270)).toBe('O');
  });

  test('clasifica el tema visual según la condición', () => {
    expect(obtenerTema('rain')).toBe('rainy');
    expect(obtenerTema('Clear')).toBe('sunny');
    expect(obtenerTema('snow')).toBe('snowy');
  });

  test('agrupa el pronóstico en 5 días futuros y descarta el día actual', () => {
    const fechas = ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23'];
    const lista = fechas.flatMap((fecha) =>
      ['09:00:00', '12:00:00', '18:00:00'].map((hora) => ({
        dt_txt: `${fecha} ${hora}`,
        main: { temp: 20, temp_max: 25, temp_min: 15 },
        weather: [{ main: 'Clouds', description: 'nublado', icon: '04d' }],
        pop: 0.3,
      }))
    );

    const resultado = agruparPronostico({ list: lista }, '2026-11-18');

    expect(resultado).toHaveLength(5);
    expect(resultado[0].fecha).toBe('2026-11-19');
    expect(resultado[0].etiqueta).toBe('Mañana');
    expect(resultado[0].tempMax).toBe(25);
    expect(resultado[0].tempMin).toBe(15);
    expect(resultado[0].probabilidadLluvia).toBe(30);
  });

  test('devuelve un arreglo vacío si no hay pronóstico', () => {
    expect(agruparPronostico(null, '2026-11-18')).toEqual([]);
    expect(agruparPronostico({ list: [] } as PronosticoResponse, '2026-11-18')).toEqual([]);
  });
});
