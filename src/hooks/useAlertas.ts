
import type { Ciudad } from '../models/ciudad.model';

export type NivelAlerta = 'alto' | 'medio' | 'bajo';

export interface Alerta {
  nivel: NivelAlerta;
  tipo: string;
  mensaje: string;
}

export interface AlertaCiudad {
  ciudad: string;
  alertas: Alerta[];
}

interface ReglaAlerta {
  condicion: (ciudad: Ciudad) => boolean;
  nivel: NivelAlerta;
  tipo: string;
  mensaje: (ciudad: Ciudad) => string;
}

const REGLAS_ALERTA: ReglaAlerta[] = [
  {
    condicion: ciudad => ciudad.precipitacion >= 10,
    nivel: 'alto',
    tipo: 'Lluvia intensa',
    mensaje: ciudad =>
      `Se registran ${ciudad.precipitacion} mm de precipitación. Evita zonas inundables y quebradas.`,
  },
  {
    condicion: ciudad => ciudad.temperatura >= 30,
    nivel: 'medio',
    tipo: 'Temperatura elevada',
    mensaje: ciudad =>
      `La temperatura es de ${ciudad.temperatura} °C. Mantente hidratado y evita la exposición prolongada al sol.`,
  },
  {
    condicion: ciudad => ciudad.uv >= 8,
    nivel: 'medio',
    tipo: 'Radiación UV elevada',
    mensaje: ciudad =>
      `El índice UV es ${ciudad.uv}. Usa protector solar, sombrero y busca sombra.`,
  },
  {
    condicion: ciudad => ciudad.viento >= 40,
    nivel: 'bajo',
    tipo: 'Vientos fuertes',
    mensaje: ciudad =>
      `Se registran vientos de ${ciudad.viento} km/h. Ten precaución en exteriores.`,
  },
];

export const evaluarAlerta = (ciudad: Ciudad): Alerta[] =>
  REGLAS_ALERTA
    .filter(regla => regla.condicion(ciudad))
    .map(regla => ({
      nivel: regla.nivel,
      tipo: regla.tipo,
      mensaje: regla.mensaje(ciudad),
    }));

export const obtenerAlertas = (
  ciudades: Ciudad[],
): AlertaCiudad[] =>
  ciudades
    .map(ciudad => ({
      ciudad: ciudad.nombre,
      alertas: evaluarAlerta(ciudad),
    }))
    .filter(resultado => resultado.alertas.length > 0);
