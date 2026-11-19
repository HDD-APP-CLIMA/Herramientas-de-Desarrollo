/** Respuesta del endpoint "current weather" de OpenWeatherMap. */
export interface WeatherData {
  name: string;
  sys: {
    country: string;
    sunrise?: number;
    sunset?: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min?: number;
    temp_max?: number;
  };
  wind: {
    speed: number;
    deg?: number;
    gust?: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  clouds?: { all: number };
  visibility?: number;
  uvi?: number;
  dt?: number;
  timezone?: number;
}

/** Un día del pronóstico de 5 días, ya normalizado para la interfaz. */
export interface PronosticoDia {
  fecha: string;
  etiqueta: string;
  tempMax: number;
  tempMin: number;
  descripcion: string;
  icon: string;
  probabilidadLluvia: number;
}

/** Respuesta del endpoint "5 day forecast" de OpenWeatherMap. */
export interface PronosticoResponse {
  list: Array<{
    dt_txt: string;
    main: {
      temp: number;
      temp_max?: number;
      temp_min?: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    pop?: number;
  }>;
}
