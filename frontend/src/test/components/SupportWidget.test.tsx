import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SupportWidget from '../../components/common/SupportWidget';
import { useUIStore } from '../../store/uiStore';

describe('SupportWidget', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.setState({ isBookingSheetOpen: false });
    });
  });

  it('shows the floating support button when no booking sheet is open', () => {
    render(<SupportWidget />);
    expect(screen.getByRole('button', { name: 'Open customer support' })).toBeInTheDocument();
  });

  it('renders nothing while the mobile booking sheet is open', () => {
    act(() => {
      useUIStore.setState({ isBookingSheetOpen: true });
    });
    render(<SupportWidget />);
    expect(screen.queryByRole('button', { name: 'Open customer support' })).toBeNull();
    expect(screen.queryByRole('dialog', { name: 'Customer support' })).toBeNull();
  });

  it('hides when the sheet opens and reappears when it closes', () => {
    render(<SupportWidget />);
    expect(screen.getByRole('button', { name: 'Open customer support' })).toBeInTheDocument();
    act(() => {
      useUIStore.setState({ isBookingSheetOpen: true });
    });
    expect(screen.queryByRole('button', { name: 'Open customer support' })).toBeNull();
    act(() => {
      useUIStore.setState({ isBookingSheetOpen: false });
    });
    expect(screen.getByRole('button', { name: 'Open customer support' })).toBeInTheDocument();
  });

  it('collapses an open support panel when the booking sheet opens', () => {
    render(<SupportWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open customer support' }));
    expect(screen.getByRole('dialog', { name: 'Customer support' })).toBeInTheDocument();
    act(() => {
      useUIStore.setState({ isBookingSheetOpen: true });
    });
    expect(screen.queryByRole('dialog', { name: 'Customer support' })).toBeNull();
    act(() => {
      useUIStore.setState({ isBookingSheetOpen: false });
    });
    // Panel must not pop back open after the sheet closes.
    expect(screen.queryByRole('dialog', { name: 'Customer support' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Open customer support' })).toBeInTheDocument();
  });
});
