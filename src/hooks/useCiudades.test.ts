import { renderHook } from '@testing-library/react';
import { test, expect } from 'vitest';
import { useCiudades } from './useCiudades';

test('debe inicializar sin ciudades', () => {
    const { result } = renderHook(() => useCiudades());

    // Estado inicial
    expect(result.current.ciudades).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
});