import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import CiudadCard from './CiudadCard';

test('renderiza el nombre de la ciudad y la temperatura', () => {
    const ciudadMock = {
        id: 1,
        nombre: 'Madrid',
        temperatura: 25,
        descripcion: 'Despejado',
    };

    render(<CiudadCard ciudad={ciudadMock as Parameters<typeof CiudadCard>[0]['ciudad']} onSeleccionar={() => { }} />);

    // Verifica que los textos aparezcan en el DOM
    expect(screen.getByText('Madrid')).toBeInTheDocument();
    expect(screen.getByText('25°C')).toBeInTheDocument();
});