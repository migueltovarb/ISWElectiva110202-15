import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';
import { describe, it, expect } from 'vitest';

// Icono simulado
const MockIcon = () => <div data-testid="icon">🔺</div>;

describe('StatCard Component', () => {
  it('renders title and value correctly', () => {
    render(<StatCard title="Usuarios" value={100} />);
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders an icon if provided', () => {
    render(
      <StatCard
        title="Sesiones"
        value={500}
        icon={<MockIcon />}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders change percentage and text with increase style', () => {
    render(
      <StatCard
        title="Crecimiento"
        value={75}
        change={10}
        changeText="Más que ayer"
        changeType="increase"
      />
    );
    expect(screen.getByText('+10%')).toBeInTheDocument();
    expect(screen.getByText('Más que ayer')).toBeInTheDocument();
    const badge = screen.getByText(/Más que ayer/).closest('div');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('renders change with decrease style', () => {
    render(
      <StatCard
        title="Pérdida"
        value={20}
        change={5}
        changeText="Menos que ayer"
        changeType="decrease"
      />
    );
    expect(screen.getByText('-5%')).toBeInTheDocument();
    expect(screen.getByText('Menos que ayer')).toBeInTheDocument();
    const badge = screen.getByText(/Menos que ayer/).closest('div');
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
  });

  it('renders neutral change styling if no changeType provided', () => {
    render(
      <StatCard
        title="Estabilidad"
        value={0}
        change={0}
        changeText="Sin cambio"
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Sin cambio')).toBeInTheDocument();
    const badge = screen.getByText(/Sin cambio/).closest('div');
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });

  it('renders only changeText when change is undefined', () => {
    render(
      <StatCard
        title="Visitantes"
        value={1200}
        changeText="Sin datos comparativos"
        changeType="neutral"
      />
    );
    expect(screen.getByText('Sin datos comparativos')).toBeInTheDocument();
  });

  it('renders only change percentage when changeText is undefined', () => {
    render(
      <StatCard
        title="Suscriptores"
        value={350}
        change={15}
        changeType="increase"
      />
    );
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });
});
