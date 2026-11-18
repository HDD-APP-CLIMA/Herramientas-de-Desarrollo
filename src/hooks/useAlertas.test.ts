import { expect, test } from 'vitest';
// Importamos los nombres exactos que tienes en tu archivo useAlertas.ts
import { evaluarAlerta, obtenerAlertas } from './useAlertas';
import type { Ciudad } from '../models/ciudad.model';

test('evaluarAlerta debe generar alertas para condiciones extremas', () => {
    const ciudadPeligro: Ciudad = {
        id: 1,
        nombre: 'Piura',
        temperatura: 35, // Debería generar alerta de Calor
        humedad: 80,
        viento: 50,      // Debería generar alerta de Viento
        uv: 9,           // Debería generar alerta UV
        precipitacion: 15, // Debería generar alerta de Lluvia
        sensacion: 36,
        descripcion: 'Cielo despejado',
        presion: 1013,
        visibilidad: 10,
        pronostico: []
    };

    const alertas = evaluarAlerta(ciudadPeligro);

    // Como la ciudad cumple las 4 condiciones, debe tener 4 alertas
    expect(alertas.length).toBe(4);
    expect(alertas[0].tipo).toBe('Lluvia intensa');
});

test('obtenerAlertas solo debe retornar ciudades que tengan alertas activas', () => {
    const ciudadesMock: Ciudad[] = [
        { id: 1, nombre: 'Lima', temperatura: 20, humedad: 60, viento: 10, uv: 4, precipitacion: 0, sensacion: 21, descripcion: 'Nublado', presion: 1012, visibilidad: 10, pronostico: [] }, // Sin alertas
        { id: 2, nombre: 'Iquitos', temperatura: 32, humedad: 90, viento: 15, uv: 10, precipitacion: 0, sensacion: 34, descripcion: 'Caluroso', presion: 1010, visibilidad: 8, pronostico: [] } // Alertas por temp y UV
    ];

    const resultado = obtenerAlertas(ciudadesMock);

    // Solo Iquitos debería estar en la lista porque Lima no tiene alertas
    expect(resultado.length).toBe(1);
    expect(resultado[0].ciudad).toBe('Iquitos');
    expect(resultado[0].alertas.length).toBeGreaterThan(0);
});