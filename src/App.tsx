import { useCallback, useEffect, useRef, useState } from 'react';
// @ts-ignore CSS is loaded by the bundler; TypeScript has no CSS module declaration.
import './index.css';

interface WeatherData {
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
}

interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
}

interface ForecastResponse {
  list: ForecastItem[];
  city?: { name: string; country: string };
}

interface DayForecast {
  date: string;
  min: number;
  max: number;
  description: string;
  icon: string;
  label: string;
}

interface FavoriteCity {
  name: string;
  country: string;
}

type Query =
  | { type: 'city'; value: string }
  | { type: 'coords'; lat: number; lon: number };

const FAVORITES_KEY = 'tempus_favorites';
const REFRESH_MS = 10 * 60 * 1000;

function loadFavorites(): FavoriteCity[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function groupForecast(list: ForecastItem[]): DayForecast[] {
  const byDay = new Map<string, ForecastItem[]>();
  for (const item of list) {
    const day = item.dt_txt.split(' ')[0];
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(item);
  }

  const days = Array.from(byDay.entries()).slice(0, 5).map(([date, items]) => {
    let min = Infinity;
    let max = -Infinity;
    for (const it of items) {
      min = Math.min(min, it.main.temp_min);
      max = Math.max(max, it.main.temp_max);
    }
    const pick =
      items.find((i) => i.dt_txt.includes('12:00:00')) ??
      items[Math.floor(items.length / 2)] ??
      items[0];
    const d = new Date(date + 'T12:00:00');
    const label = d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return {
      date,
      min,
      max,
      description: pick.weather[0]?.description ?? '',
      icon: pick.weather[0]?.icon ?? '01d',
      label,
    };
  });
  return days;
}

function App() {
  const [isCelsius, setIsCelsius] = useState(true);
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => loadFavorites());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [locating, setLocating] = useState(false);
  const lastQuery = useRef<Query | null>(null);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const fetchWeather = useCallback(async (query: Query) => {
    setLoading(true);
    setError('');

    try {
      const API_KEY = (import.meta as ImportMeta & {
        env: { VITE_OPENWEATHER_API_KEY?: string };
      }).env.VITE_OPENWEATHER_API_KEY;

      if (!API_KEY) {
        throw new Error('Falta configurar la clave de OpenWeather.');
      }

      const params =
        query.type === 'city'
          ? `q=${encodeURIComponent(query.value)}`
          : `lat=${query.lat}&lon=${query.lon}`;
      const common = `&appid=${API_KEY}&units=metric&lang=es`;

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${params}${common}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}${common}`),
      ]);

      if (!weatherRes.ok) {
        throw new Error(
          weatherRes.status === 404
            ? 'No encontramos esa ciudad. Comprueba el nombre e inténtalo otra vez.'
            : 'No pudimos consultar el clima. Inténtalo nuevamente.'
        );
      }

      const data: WeatherData = await weatherRes.json();
      setWeatherData(data);
      setCity(data.name);
      lastQuery.current =
        query.type === 'city'
          ? { type: 'city', value: data.name }
          : { type: 'coords', lat: data.coord.lat, lon: data.coord.lon };

      if (forecastRes.ok) {
        const fData: ForecastResponse = await forecastRes.json();
        setForecast(groupForecast(fData.list ?? []));
      } else {
        setForecast([]);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al consultar el clima.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('Escribe el nombre de una ciudad para consultar el clima.');
      return;
    }
    void fetchWeather({ type: 'city', value: city.trim() });
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        void fetchWeather({
          type: 'coords',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setError('No pudimos obtener tu ubicación. Revisa los permisos del navegador.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!autoRefresh || !lastQuery.current) return;
    const id = window.setInterval(() => {
      if (lastQuery.current) void fetchWeather(lastQuery.current);
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [autoRefresh, weatherData, fetchWeather]);

  const isFavorite = (name: string, country: string) =>
    favorites.some(
      (f) => f.name.toLowerCase() === name.toLowerCase() && f.country === country
    );

  const toggleFavorite = () => {
    if (!weatherData) return;
    const fav = { name: weatherData.name, country: weatherData.sys.country };
    setFavorites((prev) =>
      isFavorite(fav.name, fav.country)
        ? prev.filter(
            (f) => !(f.name.toLowerCase() === fav.name.toLowerCase() && f.country === fav.country)
          )
        : [...prev, fav]
    );
  };

  const condition = weatherData?.weather[0]?.main?.toLowerCase() ?? '';

  const weatherTheme =
    condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder')
      ? 'rainy'
      : condition.includes('cloud')
        ? 'cloudy'
        : condition.includes('snow')
          ? 'snowy'
          : condition.includes('clear')
            ? 'sunny'
            : 'default';

  const toDisplayTemp = (temp: number) =>
    Math.round(isCelsius ? temp : (temp * 9) / 5 + 32);

  const unit = isCelsius ? '°C' : '°F';

  const currentIsFav = weatherData
    ? isFavorite(weatherData.name, weatherData.sys.country)
    : false;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Tempus, inicio">
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
          <a href="#pronostico" className="nav-item">
            <span>📅</span> Pronóstico
          </a>
          <a href="#estadisticas" className="nav-item">
            <span>▥</span> Estadísticas
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-weather">
            <span className="mini-sun">🌤️</span>
            <p>Un nuevo día,<br />una nueva perspectiva.</p>
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
              Descubre qué está pasando con el clima.
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
              <p>Busca una ciudad, usa tu ubicación o elige un favorito.</p>
            </div>
          </div>

          <div className="search-actions">
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Ej. Lima, Piura, Madrid..."
                aria-label="Nombre de la ciudad"
              />
              <button type="submit" disabled={loading || locating}>
                {loading ? 'Buscando...' : 'Buscar clima →'}
              </button>
            </form>
            <button
              type="button"
              className="geo-button"
              onClick={handleGeolocation}
              disabled={loading || locating}
              title="Usar mi ubicación"
            >
              {locating ? 'Ubicando...' : '📍 Mi ubicación'}
            </button>
          </div>

          {favorites.length > 0 && (
            <div className="favorites-bar" aria-label="Ciudades favoritas">
              <span className="favorites-label">Favoritos:</span>
              {favorites.map((fav) => (
                <button
                  key={`${fav.name}-${fav.country}`}
                  type="button"
                  className="favorite-chip"
                  onClick={() => void fetchWeather({ type: 'city', value: fav.name })}
                >
                  {fav.name} <small>{fav.country}</small>
                </button>
              ))}
            </div>
          )}
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
                Consulta las condiciones meteorológicas actuales, pronóstico de 5 días
                y guarda tus ciudades favoritas.
              </p>
              <button
                className="example-button"
                onClick={() => {
                  setCity('Lima');
                  void fetchWeather({ type: 'city', value: 'Lima' });
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
            <div className="refresh-bar">
              <label className="refresh-toggle">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Actualización automática (cada 10 min)
              </label>
              <div className="refresh-meta">
                {lastUpdated && (
                  <span>Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}</span>
                )}
                <button
                  type="button"
                  className="refresh-now"
                  onClick={() => lastQuery.current && void fetchWeather(lastQuery.current)}
                >
                  ↻ Actualizar ahora
                </button>
              </div>
            </div>

            <section className={`weather-hero theme-${weatherTheme}`} id="clima">
              <div className="hero-copy">
                <span className="hero-badge">
                  <span className="live-dot" /> CLIMA ACTUAL
                </span>
                <p className="hero-location">
                  <span>⌖</span> {weatherData.name}, {weatherData.sys.country}
                </p>
                <h2 className="hero-temperature">
                  {toDisplayTemp(weatherData.main.temp)}<span>{unit}</span>
                </h2>
                <p className="hero-description">
                  {weatherData.weather[0].description}
                </p>
                <p className="hero-feels">
                  Sensación térmica de {toDisplayTemp(weatherData.main.feels_like)}
                  {unit}
                </p>
                <button
                  type="button"
                  className={`fav-toggle ${currentIsFav ? 'active' : ''}`}
                  onClick={toggleFavorite}
                >
                  {currentIsFav ? '★ Quitar de favoritos' : '☆ Agregar a favoritos'}
                </button>
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

            {forecast.length > 0 && (
              <section className="forecast-section" id="pronostico">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">PRÓXIMOS DÍAS</p>
                    <h2>Pronóstico de 5 días</h2>
                  </div>
                  <span className="section-note">📍 {weatherData.name}</span>
                </div>
                <div className="forecast-grid">
                  {forecast.map((day) => (
                    <article key={day.date} className="forecast-card">
                      <p className="forecast-day">{day.label}</p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.description}
                      />
                      <p className="forecast-desc">{day.description}</p>
                      <p className="forecast-temp">
                        <span className="max">{toDisplayTemp(day.max)}{unit}</span>
                        <span className="min">{toDisplayTemp(day.min)}{unit}</span>
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="stats-section" id="estadisticas">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">DATOS EN TIEMPO ACTUAL</p>
                  <h2>Detalles del clima</h2>
                </div>
                <span className="section-note">📍 {weatherData.name}</span>
              </div>

              <div className="stats-grid">
                <article className="stat-card humidity-card">
                  <div className="stat-top">
                    <span className="stat-icon">💧</span>
                    <span className="stat-label">Humedad</span>
                  </div>
                  <p className="stat-value">{weatherData.main.humidity}<span>%</span></p>
                  <p className="stat-description">Humedad del ambiente</p>
                  <div className="stat-progress">
                    <span style={{ width: `${weatherData.main.humidity}%` }} />
                  </div>
                </article>

                <article className="stat-card feels-card">
                  <div className="stat-top">
                    <span className="stat-icon">🌡️</span>
                    <span className="stat-label">Sensación térmica</span>
                  </div>
                  <p className="stat-value">
                    {toDisplayTemp(weatherData.main.feels_like)}<span>{unit}</span>
                  </p>
                  <p className="stat-description">Cómo se percibe la temperatura</p>
                </article>

                <article className="stat-card wind-card">
                  <div className="stat-top">
                    <span className="stat-icon">💨</span>
                    <span className="stat-label">Velocidad del viento</span>
                  </div>
                  <p className="stat-value">
                    {weatherData.wind.speed.toFixed(1)}<span> m/s</span>
                  </p>
                  <p className="stat-description">Velocidad actual del viento</p>
                </article>

                <article className="stat-card pressure-card">
                  <div className="stat-top">
                    <span className="stat-icon">◉</span>
                    <span className="stat-label">Presión atmosférica</span>
                  </div>
                  <p className="stat-value">
                    {weatherData.main.pressure}<span> hPa</span>
                  </p>
                  <p className="stat-description">Presión a nivel local</p>
                </article>
              </div>
            </section>
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
