import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const setup = (currentPage: number, totalItems = 50, itemsPerPage = 10) => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    );
    return { onPageChange };
  };

  it('renders page numbers based on totalItems and itemsPerPage', () => {
    setup(1, 50, 10); // Should render 5 pages
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('disables "Anterior" button on first page', () => {
    setup(1);
    const prevButton = screen.getByText(/anterior/i);
    expect(prevButton).toBeDisabled();
  });

  it('disables "Siguiente" button on last page', () => {
    setup(5);
    const nextButton = screen.getByText(/siguiente/i);
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange with correct page when number clicked', () => {
    const { onPageChange } = setup(2);
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with previous page when "Anterior" clicked', () => {
    const { onPageChange } = setup(3);
    fireEvent.click(screen.getByText(/anterior/i));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with next page when "Siguiente" clicked', () => {
    const { onPageChange } = setup(3);
    fireEvent.click(screen.getByText(/siguiente/i));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('applies active style to current page button', () => {
    setup(2);
    const activeButton = screen.getByText('2');
    expect(activeButton).toHaveClass('bg-primary-600');
    expect(activeButton).toHaveClass('text-white');
  });

  it('returns null if totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination
        totalItems={5}
        itemsPerPage={10}
        currentPage={1}
        onPageChange={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
