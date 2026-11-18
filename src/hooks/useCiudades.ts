
import { useEffect, useState } from 'react';
import type { Ciudad } from '../models/ciudad.model';
import { socket } from '../lib/socket';

const API = 'http://localhost:3000/api/ciudades';

interface Estado {
  ciudades: Ciudad[];
  loading: boolean;
  error: string | null;
}

export function useCiudades() {
  const [estado, setEstado] = useState<Estado>({
    ciudades: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const abortController = new AbortController();

    const fetchCiudades = async () => {
      try {
        setEstado((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }));

        const response = await fetch(API, {
          signal: abortController.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            `No se pudieron cargar las ciudades. Código HTTP: ${response.status}.`
          );
        }

        const data: Ciudad[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('La respuesta del servidor no tiene un formato válido.');
        }

        setEstado({
          ciudades: data,
          loading: false,
          error: null,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const mensaje =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error inesperado al cargar las ciudades.';

        setEstado((prev) => ({
          ...prev,
          loading: false,
          error: mensaje,
        }));
      }
    };

    void fetchCiudades();

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const onCreated = (nueva: Ciudad) => {
      setEstado((prev) => {
        if (prev.ciudades.some((c) => c.id === nueva.id)) return prev;
        return { ...prev, ciudades: [...prev.ciudades, nueva] };
      });
    };

    const onUpdated = (actualizada: Ciudad) => {
      setEstado((prev) => ({
        ...prev,
        ciudades: prev.ciudades.map((c) => (c.id === actualizada.id ? actualizada : c)),
      }));
    };

    const onDeleted = ({ id }: { id: number }) => {
      setEstado((prev) => ({
        ...prev,
        ciudades: prev.ciudades.filter((c) => c.id !== id),
      }));
    };

    socket.on('ciudades:created', onCreated);
    socket.on('ciudades:updated', onUpdated);
    socket.on('ciudades:deleted', onDeleted);

    return () => {
      socket.off('ciudades:created', onCreated);
      socket.off('ciudades:updated', onUpdated);
      socket.off('ciudades:deleted', onDeleted);
    };
  }, []);

  return estado;
}