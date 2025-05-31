import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from './Table';

describe('Table components', () => {
  it('renders the full table structure with content', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Edad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Juan</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>María</TableCell>
            <TableCell>28</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    // Comprobaciones de contenido
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('María')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('applies custom class to Table', () => {
    const { container } = render(<Table className="custom-table" />);
    const table = container.querySelector('table');
    expect(table).toHaveClass('custom-table');
  });

  it('applies custom class to TableRow', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow className="custom-row">
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const row = container.querySelector('tr');
    expect(row).toHaveClass('custom-row');
  });

  it('applies custom class to TableCell', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="custom-cell">Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const cell = container.querySelector('td');
    expect(cell).toHaveClass('custom-cell');
  });

  it('applies custom class to TableHead', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="custom-head">Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    const head = container.querySelector('th');
    expect(head).toHaveClass('custom-head');
  });
});
