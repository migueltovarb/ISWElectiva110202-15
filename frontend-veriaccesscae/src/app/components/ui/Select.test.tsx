import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest'; 
import { Select } from './Select';

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Opción 1' },
    { value: 'option2', label: 'Opción 2' },
    { value: 'option3', label: 'Opción 3' },
  ];

  it('renders all options passed via props', () => {
    render(<Select options={options} />);
    options.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('applies additional className', () => {
    render(<Select options={options} className="custom-class" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('renders error message when error prop is provided', () => {
    render(<Select options={options} error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('applies red border style when error is present', () => {
    render(<Select options={options} error="Campo requerido" />);
    const select = screen.getByRole('combobox');
    expect(select.className).toMatch(/border-red-500/);
  });

  it('handles selection change', () => {
    const handleChange = vi.fn(); // ✅ ya no da error
    render(<Select options={options} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalled();
    expect((select as HTMLSelectElement).value).toBe('option2');
  });
});
