import { act, render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExperiencePage from '../../pages/ExperiencePage';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useUIStore } from '../../store/uiStore';

// Header and Price read context hooks that normally need providers; mock the
// contexts the same way HomePage.test does so the page renders standalone.
vi.mock('../../contexts/CurrencyContext', () => ({
  CurrencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useCurrency: () => ({
    currentCurrency: 'EUR',
    setCurrentCurrency: vi.fn(),
    convertPrice: (amount: number) => amount,
    formatPrice: (amount: number) => `€${amount}`,
    currencyInfo: { code: 'EUR', name: 'Euro', label: 'EUR - €' },
    exchangeRates: { EUR: 1 },
    isLoading: false,
    lastUpdateTime: null,
  }),
}));

vi.mock('../../contexts/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useCart: () => ({
    items: [],
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    getTotalItems: () => 0,
    getTotalPrice: () => 0,
  }),
}));

// The month grid is exercised in BookingCalendar's own tests. A single fake
// picker drives the page's date state from both the card and the sheet.
vi.mock('../../components/common/BookingCalendar', () => ({
  BookingCalendar: ({ onChange }: { onChange: (ci: string, co: string) => void }) => (
    <button type="button" onClick={() => onChange('2026-06-01', '')}>
      Pick date
    </button>
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/experience/kathmandu-buddhism-monks-tour']}>
      <Routes>
        <Route path="/experience/:id" element={<ExperiencePage />} />
        <Route path="/bookings" element={<div>Bookings page</div>} />
      </Routes>
    </MemoryRouter>
  );

const openSheet = () => fireEvent.click(screen.getByRole('button', { name: 'Show dates' }));
const dialog = () => screen.getByRole('dialog', { name: /configure booking/i });
const confirmButton = () => within(dialog()).getByRole('button', { name: 'Book Now' });

describe('ExperiencePage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
    useBookingStore.setState({ bookings: [] });
    useUIStore.setState({ isBookingSheetOpen: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the tour with the sticky mobile footer (price + Book Now)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: 'Treasures of Kathmandu: Buddhism and Monks Tour' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show dates' })).toBeInTheDocument();
    // Card CTA + sticky footer CTA (sheet closed).
    expect(screen.getAllByRole('button', { name: 'Book Now' })).toHaveLength(2);
    expect(screen.getAllByText('€37').length).toBeGreaterThan(0);
  });

  it('opens the configure-booking sheet from the sticky footer and flags the ui store', () => {
    renderPage();
    openSheet();
    expect(dialog()).toBeInTheDocument();
    expect(useUIStore.getState().isBookingSheetOpen).toBe(true);
  });

  it('validates date and login in the sheet, then books and routes to bookings on Done', async () => {
    renderPage();
    openSheet();

    // Date is required first.
    fireEvent.click(confirmButton());
    expect(within(dialog()).getByText('Please select a date')).toBeInTheDocument();

    fireEvent.click(within(dialog()).getByRole('button', { name: 'Pick date' }));

    // Then login.
    fireEvent.click(confirmButton());
    expect(within(dialog()).getByText('Please log in to book this experience')).toBeInTheDocument();

    act(() => {
      useAuthStore.setState({ isAuthenticated: true, accessToken: 'test-access-token' });
    });
    // addBooking now persists the booking through POST /bookings/ with the
    // bearer token, so stub the network call the sheet can confirm offline.
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    vi.stubGlobal('fetch', fetchMock);
    fireEvent.click(confirmButton());

    await waitFor(() =>
      expect(within(dialog()).getByText(/booking requested/i)).toBeInTheDocument()
    );
    expect(within(dialog()).getByText(/2026-06-01/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/bookings/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-access-token' }),
      })
    );

    const bookings = useBookingStore.getState().bookings;
    expect(bookings).toHaveLength(1);
    expect(bookings[0]).toMatchObject({
      date: '2026-06-01',
      experienceTitle: 'Treasures of Kathmandu: Buddhism and Monks Tour',
    });

    fireEvent.click(within(dialog()).getByRole('button', { name: 'Done' }));
    expect(screen.getByText('Bookings page')).toBeInTheDocument();
    expect(useUIStore.getState().isBookingSheetOpen).toBe(false);
  });
});
