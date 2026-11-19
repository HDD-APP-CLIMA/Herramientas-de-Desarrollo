import type { PronosticoDia, WeatherData } from '../models/clima.model';

export type NivelConsejo = 'alto' | 'medio' | 'bajo';

export interface Actividad {
  icono: string;
  titulo: string;
  detalle: string;
  categoria: string;
}

export interface Consejo {
  icono: string;
  texto: string;
  nivel: NivelConsejo;
}

export interface ResumenDia {
  emoji: string;
  titulo: string;
  texto: string;
}

export interface ConsejosDelDia {
  resumen: ResumenDia;
  actividades: Actividad[];
  recomendaciones: Consejo[];
  precauciones: Consejo[];
}

type GrupoClima =
  | 'tormenta'
  | 'lluvia'
  | 'nieve'
  | 'niebla'
  | 'viento'
  | 'nublado'
  | 'despejado';

function clasificarClima(condicion: string): GrupoClima {
  const texto = condicion.toLowerCase();
  if (texto.includes('thunder')) return 'tormenta';
  if (texto.includes('snow')) return 'nieve';
  if (texto.includes('rain') || texto.includes('drizzle')) return 'lluvia';
  if (texto.includes('mist') || texto.includes('fog') || texto.includes('haze')) {
    return 'niebla';
  }
  if (texto.includes('wind')) return 'viento';
  if (texto.includes('cloud')) return 'nublado';
  if (texto.includes('clear') || texto.includes('sun')) return 'despejado';
  return 'nublado';
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Genera planes, recomendaciones y precauciones a partir de las condiciones
 * actuales y del pronóstico. Toda la lógica es determinista para poder probarla.
 */
export function generarConsejos(
  datos: WeatherData,
  pronostico: PronosticoDia[] = []
): ConsejosDelDia {
  const condicion = datos.weather[0]?.main ?? '';
  const descripcion = datos.weather[0]?.description ?? '';
  const grupo = clasificarClima(condicion);
  const temp = datos.main.temp;
  const humedad = datos.main.humidity;
  const viento = datos.wind.speed;
  const visibilidad = datos.visibility;
  const lluviaProbable =
    grupo === 'lluvia' ||
    grupo === 'tormenta' ||
    (pronostico[0]?.probabilidadLluvia ?? 0) >= 50;
  const muchoFrio = temp < 5;
  const frio = temp < 15;
  const calor = temp >= 30;
  const muchoCalor = temp >= 35;

  let resumen: ResumenDia;
  if (grupo === 'tormenta') {
    resumen = {
      emoji: '⛈️',
      titulo: 'Mejor plan: quedarse en casa',
      texto: 'Hay tormenta. Prioriza espacios cubiertos y evita desplazamientos innecesarios.',
    };
  } else if (grupo === 'lluvia') {
    resumen = {
      emoji: '🌧️',
      titulo: 'Un día para planes con paraguas',
      texto: 'La lluvia no tiene por qué arruinar el día: elige planes en interiores o lleva impermeable.',
    };
  } else if (grupo === 'nieve') {
    resumen = {
      emoji: '❄️',
      titulo: 'Día de nieve, abrígate bien',
      texto: 'El paisaje invita a salir, pero necesitarás ropa abrigada y calzado seguro.',
    };
  } else if (grupo === 'niebla') {
    resumen = {
      emoji: '🌫️',
      titulo: 'Día con poca visibilidad',
      texto: 'Toma precauciones si vas a conducir y elige actividades cercanas.',
    };
  } else if (grupo === 'viento') {
    resumen = {
      emoji: '💨',
      titulo: 'Día ventoso, asegura tus planes',
      texto: 'Puede haber ráfagas fuertes: vigila objetos sueltos y zonas con árboles.',
    };
  } else if (grupo === 'despejado' && calor) {
    resumen = {
      emoji: '🌞',
      titulo: 'Sol intenso: hidrátate',
      texto: 'Aprovecha el día temprano o al atardecer y protector solar siempre contigo.',
    };
  } else if (grupo === 'despejado') {
    resumen = {
      emoji: '☀️',
      titulo: 'Buen día para estar al aire libre',
      texto: 'Las condiciones acompañan para caminar, andar en bici o disfrutar de un picnic.',
    };
  } else if (frio) {
    resumen = {
      emoji: '🧥',
      titulo: 'Día fresco, vístete en capas',
      texto: 'Un abrigo ligero y una bebida caliente harán más cómodo el paseo.',
    };
  } else {
    resumen = {
      emoji: '🌥️',
      titulo: 'Día cómodo para salir',
      texto: 'Sin lluvia y con temperatura agradable: es un buen momento para tus planes.',
    };
  }

  const actividades: Actividad[] = [];
  const agregar = (actividad: Actividad) => {
    if (!actividades.some((item) => item.titulo === actividad.titulo)) {
      actividades.push(actividad);
    }
  };

  if (grupo === 'tormenta' || grupo === 'lluvia') {
    agregar({
      icono: '🎬',
      titulo: 'Maratón de películas en casa',
      detalle: 'Prepara palomitas y elige esa serie que tenías pendiente.',
      categoria: 'En casa',
    });
    agregar({
      icono: '🏛️',
      titulo: 'Visita un museo o galería',
      detalle: 'Los interiores son el mejor refugio mientras pasa el aguacero.',
      categoria: 'En interiores',
    });
    agregar({
      icono: '📚',
      titulo: 'Leer con un café',
      detalle: 'Aprovecha el sonido de la lluvia para desconectar un rato.',
      categoria: 'Relax',
    });
  }

  if (grupo === 'nieve') {
    agregar({
      icono: '⛄',
      titulo: 'Construir un muñeco de nieve',
      detalle: 'Un clásico que funciona mejor con guantes y ropa impermeable.',
      categoria: 'Al aire libre',
    });
    agregar({
      icono: '📷',
      titulo: 'Fotografía de paisaje invernal',
      detalle: 'La luz sobre la nieve crea escenas únicas.',
      categoria: 'Creatividad',
    });
    agregar({
      icono: '☕',
      titulo: 'Chocolate caliente al volver',
      detalle: 'Recompensa el frío con una bebida bien caliente.',
      categoria: 'Relax',
    });
  }

  if (grupo === 'despejado' && calor) {
    agregar({
      icono: '🏊',
      titulo: 'Piscina o playa temprano',
      detalle: 'Disfruta el agua antes de que el sol esté en su punto más fuerte.',
      categoria: 'Al aire libre',
    });
    agregar({
      icono: '🛍️',
      titulo: 'Planes en centros con aire acondicionado',
      detalle: 'Compras o cine son una buena opción durante la tarde.',
      categoria: 'En interiores',
    });
  } else if (grupo === 'despejado') {
    agregar({
      icono: '🥾',
      titulo: 'Caminata o senderismo',
      detalle: 'El cielo despejado invita a explorar un sendero nuevo.',
      categoria: 'Al aire libre',
    });
    agregar({
      icono: '🚲',
      titulo: 'Paseo en bicicleta',
      detalle: 'Elige una ruta con sombra y lleva agua contigo.',
      categoria: 'Al aire libre',
    });
    agregar({
      icono: '🧺',
      titulo: 'Picnic en el parque',
      detalle: 'Una manta, tus snacks favoritos y buena compañía.',
      categoria: 'Al aire libre',
    });
  }

  if (grupo === 'nublado') {
    agregar({
      icono: '🚶',
      titulo: 'Recorre la ciudad sin prisa',
      detalle: 'Sin sol fuerte ni lluvia, caminar es más cómodo.',
      categoria: 'Al aire libre',
    });
    agregar({
      icono: '☕',
      titulo: 'Café con vista',
      detalle: 'Busca una terraza o una ventana con buena luz.',
      categoria: 'Relax',
    });
  }

  if (grupo === 'niebla') {
    agregar({
      icono: '🖼️',
      titulo: 'Exposición o museo cercano',
      detalle: 'Un plan cómodo y a cubierto de la neblina.',
      categoria: 'En interiores',
    });
  }

  if (grupo === 'viento' && viento >= 3 && viento < 10) {
    agregar({
      icono: '🪁',
      titulo: 'Volar una cometa',
      detalle: 'El viento es suficiente y el cielo acompaña. Elige un parque abierto.',
      categoria: 'Al aire libre',
    });
  }

  if (frio || muchoFrio) {
    agregar({
      icono: '🍲',
      titulo: 'Comida caliente en casa',
      detalle: 'Una sopa o un guiso es el mejor plan para entrar en calor.',
      categoria: 'En casa',
    });
  }

  if (lluviaProbable && grupo !== 'lluvia' && grupo !== 'tormenta') {
    agregar({
      icono: '🎨',
      titulo: 'Taller o actividad creativa',
      detalle: 'Pintar, cocinar o escribir: planes que funcionan llueva o no.',
      categoria: 'En casa',
    });
  }

  agregar({
    icono: '🎧',
    titulo: 'Descubre música nueva',
    detalle: 'Crea una lista para acompañar el resto del día.',
    categoria: 'Relax',
  });
  agregar({
    icono: '🗓️',
    titulo: 'Organiza tus próximos planes',
    detalle: 'Revisa el pronóstico y elige el mejor día para salir.',
    categoria: 'En casa',
  });
  agregar({
    icono: '🍳',
    titulo: 'Prueba una receta nueva',
    detalle: 'Un plan que siempre funciona, sin importar el tiempo afuera.',
    categoria: 'En casa',
  });

  const recomendaciones: Consejo[] = [];
  const recomendar = (icono: string, texto: string) =>
    recomendaciones.push({ icono, texto, nivel: 'bajo' });

  if (muchoCalor) {
    recomendar('💧', 'Hidrátate constantemente y evita el sol entre las 11:00 y las 16:00.');
  } else if (calor) {
    recomendar('🧴', 'Usa protector solar FPS 30 o más y ropa ligera de colores claros.');
  } else if (frio) {
    recomendar('🧣', 'Vístete en capas: una primera capa térmica y un abrigo exterior.');
  } else {
    recomendar('👕', 'La temperatura es cómoda: una camiseta y una capa ligera bastarán.');
  }

  if (humedad >= 75) {
    recomendar('🌬️', 'El ambiente está muy húmedo; elige telas transpirables y ventilación.');
  } else if (humedad <= 30) {
    recomendar('🧴', 'El aire está seco: aplica crema hidratante y bebe agua con frecuencia.');
  }

  if (lluviaProbable) {
    recomendar('☂️', 'Lleva paraguas o impermeable, aunque el cielo esté despejado ahora.');
  }

  if (viento >= 6) {
    recomendar('🧢', 'Usa gorra o sombrero bien ajustado y cuida los objetos sueltos.');
  }

  if (datos.uvi !== undefined && datos.uvi >= 6) {
    recomendar('🕶️', `Índice UV ${capitalizar(datos.uvi >= 8 ? 'muy alto' : 'alto')}: usa gafas de sol y sombra.`);
  }

  if (recomendaciones.length < 3) {
    recomendar('📱', 'Consulta el pronóstico antes de salir de casa.');
  }

  const precauciones: Consejo[] = [];
  const precaver = (icono: string, texto: string, nivel: NivelConsejo) =>
    precauciones.push({ icono, texto, nivel });

  if (grupo === 'tormenta') {
    precaver('⚡', 'Busca refugio en un edificio; evita árboles, postes y objetos metálicos.', 'alto');
    precaver('🔌', 'Desconecta equipos electrónicos si hay riesgo de rayos.', 'medio');
  } else if (descripcion.includes('intensa')) {
    precaver('🌊', 'No cruces zonas inundadas ni calles con corriente de agua.', 'alto');
    precaver('🚗', 'Conduce despacio y aumenta la distancia de frenado.', 'medio');
  } else if (grupo === 'lluvia') {
    precaver('⚠️', 'Precaución con superficies resbaladizas y escaleras mojadas.', 'medio');
  }

  if (viento >= 10) {
    precaver('💨', 'Evita caminar bajo árboles o carteles: puede haber ramas sueltas.', 'alto');
  } else if (viento >= 6) {
    precaver('🌪️', 'Asegura macetas y objetos en balcones o terrazas.', 'medio');
  }

  if (muchoCalor) {
    precaver('🥵', 'Riesgo de golpe de calor: reduce el esfuerzo físico y busca sombra.', 'alto');
  } else if (calor && humedad >= 70) {
    precaver('🌡️', 'Con calor y humedad altos, hidrátate aunque no sientas sed.', 'medio');
  }

  if (temp <= 0) {
    precaver('🧊', 'Protege manos, orejas y nariz: hay riesgo de congelación.', 'alto');
  } else if (muchoFrio) {
    precaver('❄️', 'Limita la exposición prolongada al aire libre.', 'medio');
  }

  if (visibilidad !== undefined && visibilidad < 2) {
    precaver('🌫️', 'Conduce con luces bajas, velocidad reducida y mayor distancia.', 'alto');
  }

  if (grupo === 'nieve') {
    precaver('🥾', 'Usa calzado antideslizante y camina con pasos cortos.', 'medio');
  }

  if (precauciones.length === 0) {
    precaver('✅', 'Sin riesgos relevantes, pero mantente atento a cambios del clima.', 'bajo');
  }
  if (precauciones.length === 1) {
    precaver('👀', 'Revisa el pronóstico antes de planear actividades largas.', 'bajo');
  }

  return {
    resumen,
    actividades: actividades.slice(0, 4),
    recomendaciones: recomendaciones.slice(0, 4),
    precauciones: precauciones.slice(0, 4),
  };
}
