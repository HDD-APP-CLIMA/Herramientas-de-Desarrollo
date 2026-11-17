import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import AlertasPanel from './AlertasPanel';

test('renderiza los mensajes de alerta correctamente', () => {
    const alertasMock = ['Tormenta inminente', 'Vientos fuertes'] as unknown as
        React.ComponentProps<typeof AlertasPanel>['alertas'];

    render(<AlertasPanel alertas={alertasMock} onSeleccionar={() => {}} />);

    expect(screen.getByText('Tormenta inminente')).toBeInTheDocument();
    expect(screen.getByText('Vientos fuertes')).toBeInTheDocument();
});