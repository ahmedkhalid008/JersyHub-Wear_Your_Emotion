import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders JerseyHub branding header', () => {
    render(<App />);
    const headerBranding = screen.getAllByText(/JERSEY/i);
    expect(headerBranding.length).toBeGreaterThan(0);
    expect(headerBranding[0]).toBeInTheDocument();
  });

  it('renders sportswear hero text', () => {
    render(<App />);
    expect(screen.getByText(/Wear Your/i)).toBeInTheDocument();
  });
});
