import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Loading } from './Loading';

describe('Loading', () => {
  it('renders the spinner element', () => {
    render(<Loading />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders the message if provided', () => {
    render(<Loading message="Cargando..." />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('applies size class for "sm"', () => {
    render(<Loading size="sm" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner.className).toMatch(/h-4/);
    expect(spinner.className).toMatch(/w-4/);
    expect(spinner.className).toMatch(/border-2/);
  });

  it('applies size class for "md" by default', () => {
    render(<Loading />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner.className).toMatch(/h-8/);
    expect(spinner.className).toMatch(/w-8/);
    expect(spinner.className).toMatch(/border-4/);
  });

  it('applies size class for "lg"', () => {
    render(<Loading size="lg" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner.className).toMatch(/h-12/);
    expect(spinner.className).toMatch(/w-12/);
    expect(spinner.className).toMatch(/border-4/);
  });

  it('applies custom className to the container', () => {
    render(<Loading className="custom-class" />);
    const container = screen.getByTestId('spinner').parentElement;
    expect(container?.className).toMatch(/custom-class/);
  });
});
