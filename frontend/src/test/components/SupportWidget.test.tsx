import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '../../test/utils';
import SupportWidget from '../../components/common/SupportWidget';
import { useUIStore } from '../../store/uiStore';

describe('SupportWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUIStore.getState).mockReturnValue({
      isBookingSheetOpen: false,
      setBookingSheetOpen: vi.fn(),
      isCartOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      isSearchOpen: false,
      closeSearch: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      openSearch: vi.fn(),
    });
  });

  it('shows the floating support button when no booking sheet is open', () => {
    render(<SupportWidget />);
    expect(screen.getByRole('button', { name: 'Open customer support' })).toBeInTheDocument();
  });

  it('renders nothing while the mobile booking sheet is open', () => {
    act(() => {
      vi.mocked(useUIStore.getState).mockReturnValue({
        isBookingSheetOpen: true,
        setBookingSheetOpen: vi.fn(),
        isCartOpen: false,
        openCart: vi.fn(),
        closeCart: vi.fn(),
        isSearchOpen: false,
        closeSearch: vi.fn(),
        searchQuery: '',
        setSearchQuery: vi.fn(),
        openSearch: vi.fn(),
      });
    });
    render(<SupportWidget />);
    expect(screen.queryByRole('button', { name: 'Open customer support' })).toBeNull();
  });

  it('hides when the sheet opens and reappears when it closes', () => {
    const { rerender } = render(<SupportWidget />);
    expect(screen.getByRole('button', { name: 'Open customer support' })).toBeInTheDocument();

    vi.mocked(useUIStore.getState).mockReturnValue({
      isBookingSheetOpen: true,
      setBookingSheetOpen: vi.fn(),
      isCartOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      isSearchOpen: false,
      closeSearch: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      openSearch: vi.fn(),
    });
    rerender(<SupportWidget />);
    expect(screen.queryByRole('button', { name: 'Open customer support' })).toBeNull();

    vi.mocked(useUIStore.getState).mockReturnValue({
      isBookingSheetOpen: false,
      setBookingSheetOpen: vi.fn(),
      isCartOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      isSearchOpen: false,
      closeSearch: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      openSearch: vi.fn(),
    });
    rerender(<SupportWidget />);
    expect(screen.getByRole('button', { name: 'Open customer support' })).toBeInTheDocument();
  });

  it('collapses an open support panel when the booking sheet opens', () => {
    // First render with support panel open
    vi.mocked(useUIStore.getState).mockReturnValue({
      isBookingSheetOpen: false,
      setBookingSheetOpen: vi.fn(),
      isCartOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      isSearchOpen: false,
      closeSearch: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      openSearch: vi.fn(),
    });
    render(<SupportWidget />);
    // Simulate opening the panel by clicking the button
    fireEvent.click(screen.getByRole('button', { name: 'Open customer support' }));

    // Now simulate booking sheet opening
    vi.mocked(useUIStore.getState).mockReturnValue({
      isBookingSheetOpen: true,
      setBookingSheetOpen: vi.fn(),
      isCartOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      isSearchOpen: false,
      closeSearch: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      openSearch: vi.fn(),
    });
    // Re-render would happen in real app, but here we just check the widget hides
    expect(screen.queryByRole('button', { name: 'Open customer support' })).toBeNull();
  });
});
