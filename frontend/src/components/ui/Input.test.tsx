import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders input with label and placeholder', () => {
    render(<Input label="Email Address" placeholder="user@example.com" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(<Input label="Password" error="Password is required" />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('triggers onChange handler when typed into', () => {
    const handleChange = vi.fn();
    render(<Input label="Full Name" onChange={handleChange} />);
    const input = screen.getByLabelText(/full name/i);
    fireEvent.change(input, { target: { value: 'Jane Doe' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
