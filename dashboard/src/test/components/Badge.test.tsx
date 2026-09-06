import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../../components/Badge';

describe('Badge Component', () => {
  it('renders badge with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('renders with different sizes', () => {
    const { container } = render(<Badge size="lg">Large Badge</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('text-sm');
  });
});