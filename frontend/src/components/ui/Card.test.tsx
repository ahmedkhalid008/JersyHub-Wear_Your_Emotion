import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

describe('Card Component', () => {
  it('renders Card with header, title, description, content, and footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Body Content</p>
        </CardContent>
        <CardFooter>
          <span>Footer Action</span>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Card Body Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Action')).toBeInTheDocument();
  });
});
