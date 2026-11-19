const { spawn } = require('node:child_process');

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const apiUrl = new URL(
  process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3000}/api`
);
const citiesUrl = new URL(
  `${apiUrl.pathname.replace(/\/$/, '')}/ciudades`,
  apiUrl.origin
);
const processes = [];
let stopping = false;

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (child.exitCode === null) child.kill('SIGTERM');
  }
  process.exitCode = exitCode;
}

function start(args, required = false) {
  const child = spawn(process.execPath, args, { stdio: 'inherit' });
  processes.push(child);
  child.on('error', (error) => {
    console.error('No se pudo iniciar un servicio de desarrollo:', error.message);
    stopAll(1);
  });
  child.on('exit', (code) => {
    if (stopping) return;
    if (required) {
      stopAll(code ?? 1);
    } else {
      console.error(`La API terminó con código ${code ?? 'desconocido'}.`);
    }
  });
  return child;
}

async function apiIsRunning() {
  try {
    const response = await fetch(citiesUrl, { signal: AbortSignal.timeout(1200) });
    if (!response.ok) return false;
    return Array.isArray(await response.json());
  } catch {
    return false;
  }
}

async function startDevelopment() {
  if (await apiIsRunning()) {
    console.log(`API existente detectada en ${apiUrl.origin}; se reutilizará.`);
  } else {
    start(['server.js']);
  }

  start(['node_modules/vite/bin/vite.js', '--host', '0.0.0.0', '--port', '5173', '--strictPort'], true);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

startDevelopment().catch((error) => {
  console.error('No se pudo iniciar el entorno de desarrollo:', error.message);
  stopAll(1);
});
