import { useMemo, useState } from 'react';
// @ts-ignore CSS is loaded by the bundler; TypeScript has no CSS module declaration.
import './index.css';

import type {
  PronosticoDia,
  PronosticoResponse,
  WeatherData,
} from './models/clima.model';
import {
  agruparPronostico,
  fechaLocalClima,
  formatearTemperatura,
  obtenerCondicion,
  obtenerEmoji,
  obtenerTema,
  simboloUnidad,
} from './utils/clima';
import { generarConsejos } from './utils/recomendaciones';
import ConsejosClima from './components/ConsejosClima';
import DetallesClima from './components/DetallesClima';
import PlanDelDia from './components/PlanDelDia';
import Pronostico5Dias from './components/Pronostico5Dias';

function obtenerApiKey(): string | undefined {
  return (import.meta as ImportMeta & {
    env: { VITE_OPENWEATHER_API_KEY?: string };
  }).env.VITE_OPENWEATHER_API_KEY;
}

function App() {
  const [isCelsius, setIsCelsius] = useState(true);
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [pronostico, setPronostico] = useState<PronosticoDia[]>([]);
  const [loading, setLoading] = useState(false);
  const [cargandoPronostico, setCargandoPronostico] = useState(false);
  const [error, setError] = useState('');
  const [errorPronostico, setErrorPronostico] = useState('');

  const cargarPronostico = async (searchCity: string, datos: WeatherData) => {
    setPronostico([]);
    setErrorPronostico('');
    setCargandoPronostico(true);

    try {
      const API_KEY = obtenerApiKey();
      if (!API_KEY) throw new Error('Falta configurar la clave de OpenWeather.');

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          searchCity
        )}&appid=${API_KEY}&units=metric&lang=es`
      );

      if (!response.ok) throw new Error('Pronóstico no disponible');

      const data: PronosticoResponse = await response.json();
      setPronostico(agruparPronostico(data, fechaLocalClima(datos)));
    } catch {
      setErrorPronostico(
        'No pudimos cargar el pronóstico de los próximos 5 días. El clima actual sí está disponible.'
      );
    } finally {
      setCargandoPronostico(false);
    }
  };

  const fetchWeather = async (searchCity = city) => {
    if (!searchCity.trim()) {
      setError('Escribe el nombre de una ciudad para consultar el clima.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // La clave se configura en el archivo .env del proyecto.
      const API_KEY = obtenerApiKey();

      if (!API_KEY) {
        throw new Error('Falta configurar la clave de OpenWeather.');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          searchCity
        )}&appid=${API_KEY}&units=metric&lang=es`
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'No encontramos esa ciudad. Comprueba el nombre e inténtalo otra vez.'
            : 'No pudimos consultar el clima. Inténtalo nuevamente.'
        );
      }

      const data: WeatherData = await response.json();
      setWeatherData(data);
      setCity(data.name);
      void cargarPronostico(data.name, data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al consultar el clima.'
      );
    } finally {
      setLoading(false);
    }
  };

  const condicion = weatherData ? obtenerCondicion(weatherData) : '';
  const weatherTheme = obtenerTema(condicion);
  const weatherEmoji = obtenerEmoji(condicion);
  const unidad = simboloUnidad(isCelsius);

  const consejos = useMemo(
    () => (weatherData ? generarConsejos(weatherData, pronostico) : null),
    [weatherData, pronostico]
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Tempus, inicio">
          <span className="brand-icon">☀</span>
          <span>tempus<span className="brand-dot">.</span></span>
        </a>

        <p className="nav-label">MENÚ PRINCIPAL</p>

        <nav className="main-nav" aria-label="Navegación principal">
          <a href="#inicio" className="nav-item active">
            <span>▦</span> Dashboard
          </a>
          <a href="#clima" className="nav-item">
            <span>🌦</span> Estado del clima
          </a>
          <a href="#estadisticas" className="nav-item">
            <span>▥</span> Estadísticas
          </a>
          <a href="#plan" className="nav-item">
            <span>✦</span> Plan del día
          </a>
          <a href="#pronostico" className="nav-item">
            <span>▤</span> Pronóstico
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-weather">
            <span className="mini-sun" aria-hidden="true">
              {weatherData ? weatherEmoji : '🌤️'}
            </span>
            <p>
              {weatherData ? (
                <>
                  Hoy en {weatherData.name}<br />
                  {weatherData.weather[0]?.description ?? 'Condiciones cambiantes'}
                </>
              ) : (
                <>Un nuevo día,<br />una nueva perspectiva.</>
              )}
            </p>
          </div>
          <p className="sidebar-caption">TEMPUS WEATHER</p>
          <p className="sidebar-version">Panel meteorológico</p>
        </div>
      </aside>

      <main className="main-content" id="inicio">
        <header className="topbar">
          <div>
            <p className="eyebrow">TU ESPACIO METEOROLÓGICO</p>
            <h1>Weather Dashboard<span>.</span></h1>
            <p className="topbar-subtitle">
              Descubre qué está pasando con el clima y planea mejor tu día.
            </p>
          </div>

          <div className="unit-switch" aria-label="Unidad de temperatura">
            <button
              className={isCelsius ? 'unit-option selected' : 'unit-option'}
              onClick={() => setIsCelsius(true)}
              aria-pressed={isCelsius}
            >
              °C
            </button>
            <button
              className={!isCelsius ? 'unit-option selected' : 'unit-option'}
              onClick={() => setIsCelsius(false)}
              aria-pressed={!isCelsius}
            >
              °F
            </button>
          </div>
        </header>

        <section className="search-panel" aria-label="Buscar ciudad">
          <div className="search-copy">
            <span className="search-icon">⌕</span>
            <div>
              <h2>¿Qué clima hace hoy?</h2>
              <p>Busca una ciudad y descubre sus condiciones actuales.</p>
            </div>
          </div>

          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault();
              void fetchWeather();
            }}
          >
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Ej. Lima, Piura, Madrid..."
              aria-label="Nombre de la ciudad"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar clima →'}
            </button>
          </form>
        </section>

        {error && (
          <div className="feedback error-feedback" role="alert">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading-panel" role="status">
            <span className="spinner" />
            <p>Consultando las condiciones meteorológicas...</p>
          </div>
        )}

        {!weatherData && !loading && !error && (
          <section className="welcome-panel">
            <div className="welcome-copy">
              <span className="welcome-badge">✦ BIENVENIDO A TEMPUS</span>
              <h2>El clima cambia.<br />Tu día sigue.</h2>
              <p>
                Consulta el clima actual, recibe ideas para tu día, consejos
                personalizados y el pronóstico de los próximos 5 días.
              </p>
              <button
                className="example-button"
                onClick={() => {
                  setCity('Lima');
                  void fetchWeather('Lima');
                }}
              >
                Explorar Lima <span>→</span>
              </button>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <span className="art-sun">☀️</span>
              <span className="art-cloud">☁️</span>
              <span className="art-sparkle sparkle-one">✦</span>
              <span className="art-sparkle sparkle-two">✧</span>
              <span className="art-circle" />
            </div>
          </section>
        )}

        {weatherData && !loading && (
          <>
            <section className={`weather-hero theme-${weatherTheme}`} id="clima">
              <div className="hero-copy">
                <span className="hero-badge">
                  <span className="live-dot" /> CLIMA ACTUAL
                </span>
                <p className="hero-location">
                  <span>⌖</span> {weatherData.name}, {weatherData.sys.country}
                </p>
                <h2 className="hero-temperature">
                  {formatearTemperatura(weatherData.main.temp, isCelsius)}<span>{unidad}</span>
                </h2>
                <p className="hero-description">
                  {weatherData.weather[0].description}
                </p>
                <p className="hero-feels">
                  Sensación térmica de {formatearTemperatura(weatherData.main.feels_like, isCelsius)}
                  {unidad}
                </p>
              </div>

              <div className="hero-art">
                <div className="hero-art-glow" />
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                  alt={weatherData.weather[0].description}
                />
                <span className="hero-art-sparkle">✦</span>
              </div>

              <div className="hero-decoration decoration-one" />
              <div className="hero-decoration decoration-two" />
            </section>

            <DetallesClima datos={weatherData} esCelsius={isCelsius} />

            {consejos && (
              <>
                <PlanDelDia
                  resumen={consejos.resumen}
                  actividades={consejos.actividades}
                  tema={weatherTheme}
                />
                <ConsejosClima
                  recomendaciones={consejos.recomendaciones}
                  precauciones={consejos.precauciones}
                />
              </>
            )}

            <Pronostico5Dias
              dias={pronostico}
              cargando={cargandoPronostico}
              error={errorPronostico}
              unidad={unidad}
              esCelsius={isCelsius}
            />
          </>
        )}

        <footer className="app-footer">
          <span><span className="footer-sun">☀</span> tempus.</span>
          <p>El tiempo, en una nueva perspectiva.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
