import { renderHook, act } from '@testing-library/react';
import { expect, test } from 'vitest';
import { useFavorita } from './useFavorita';

test('debe guardar y remover una ciudad de favoritas', () => {
    const { result } = renderHook(() => useFavorita());

    act(() => {
        result.current.toggleFavorita(1);
    });

    expect(result.current.esFavorita(1)).toBe(true);

    act(() => {
        result.current.toggleFavorita(1);
    });

    expect(result.current.esFavorita(1)).toBe(false);
});