import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Header from './Header';

test('renderiza el título y los enlaces de navegación', () => {
    render(<Header />);

    // Asumiendo que tu Header tiene un título o logo de texto
    expect(screen.getByText(/Herramientas de Desarrollo/i)).toBeInTheDocument();
    // Asumiendo que tienes enlaces (ajusta los textos según tu diseño)
    expect(screen.getByRole('navigation')).toBeInTheDocument();
});