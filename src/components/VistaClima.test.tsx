import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import VistaClima from './VistaClima';

test('muestra el estado de carga y luego los detalles', () => {
    // Prueba cuando está cargando
    const VistaClimaWithProps = VistaClima as React.ComponentType<{ isLoading: boolean; data: { name: string; temp: number; humidity: number } | null }>;

    const { rerender } = render(<VistaClimaWithProps isLoading={true} data={null} />);
    expect(screen.getByText(/Buscando.../i)).toBeInTheDocument(); // O la clase de tu spinner

    // Prueba cuando ya cargó los datos
    const dataMock = { name: 'Arequipa', temp: 22, humidity: 40 };
    rerender(<VistaClimaWithProps isLoading={false} data={dataMock} />);

    expect(screen.queryByText(/Buscando.../i)).not.toBeInTheDocument();
    expect(screen.getByText('Arequipa')).toBeInTheDocument();
});