import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Alert, AlertTitle, AlertDescription } from './Alert';

describe('Alert', () => {
  it('renders children correctly', () => {
    render(<Alert>Test Alert</Alert>);
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  it('renders with variant classes', () => {
    render(<Alert variant="error">Error Alert</Alert>);
    const alert = screen.getByText('Error Alert');
    expect(alert).toHaveClass('bg-red-50', 'text-red-800', 'border-red-500');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Closable Alert</Alert>);
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button if onClose is not provided', () => {
    render(<Alert>No Close Button</Alert>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('AlertTitle', () => {
  it('renders the alert title', () => {
    render(<AlertTitle>Important</AlertTitle>);
    expect(screen.getByText('Important')).toBeInTheDocument();
  });
});

describe('AlertDescription', () => {
  it('renders the alert description', () => {
    render(<AlertDescription>This is an alert</AlertDescription>);
    expect(screen.getByText('This is an alert')).toBeInTheDocument();
  });
});
