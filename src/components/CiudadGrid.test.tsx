import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import CiudadGrid from './CiudadGrid';

test('renderiza una lista de tarjetas de ciudad', () => {
    const ciudadesMock = [
        { id: 1, nombre: 'Madrid', name: 'Madrid', temperatura: 20, temp: 20, sensacion: 20, descripcion: 'soleado', description: 'soleado' },
        { id: 2, nombre: 'Bogotá', name: 'Bogotá', temperatura: 15, temp: 15, sensacion: 15, descripcion: 'lluvia', description: 'lluvia' }
    ];

    render(<CiudadGrid ciudades={ciudadesMock as never} onSeleccionar={vi.fn()} />);

    expect(screen.getByText('Madrid')).toBeInTheDocument();
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
});