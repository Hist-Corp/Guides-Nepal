import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GuideRegistrationWizard from '../../pages/guide/GuideRegistrationWizard';

vi.mock('../../contexts/CurrencyContext', () => ({
  CurrencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useCurrency: () => ({
    currentCurrency: 'USD',
    setCurrentCurrency: vi.fn(),
    convertPrice: (amount: number) => amount,
    currencyInfo: { code: 'USD', name: 'US Dollar', label: 'USD - $' },
    exchangeRates: { USD: 1 },
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

vi.mock('../../store/uiStore', () => ({
  useUIStore: () => ({
    isSearchOpen: false,
    searchQuery: '',
    isCartOpen: false,
    isBookingSheetOpen: false,
    openSearch: vi.fn(),
    closeSearch: vi.fn(),
    setSearchQuery: vi.fn(),
    openCart: vi.fn(),
    closeCart: vi.fn(),
    setBookingSheetOpen: vi.fn(),
  }),
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    login: vi.fn(),
    logout: vi.fn(),
    setTokens: vi.fn(),
    refreshTokens: vi.fn(),
    setRememberMe: vi.fn(),
    rememberMe: false,
  }),
}));

vi.mock('../../store/profileStore', () => ({
  useProfileStore: () => ({ profile: {} }),
}));

vi.mock('../../store/bookingStore', () => ({
  useBookingStore: () => ({ bookings: [], addBooking: vi.fn() }),
}));

vi.mock('../../components/common/Header', () => ({
  __esModule: true,
  Header: () => null,
  default: () => null,
}));

vi.mock('../../components/common/Footer', () => ({
  __esModule: true,
  Footer: () => null,
  default: () => null,
}));

vi.mock('axios', () => ({
  __esModule: true,
  default: { post: vi.fn(), create: vi.fn() },
}));

import axios from 'axios';
const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> };

const renderWizard = () =>
  render(
    <BrowserRouter>
      <GuideRegistrationWizard />
    </BrowserRouter>
  );

beforeEach(() => {
  localStorage.removeItem('gn-guide-registration-draft');
  mockedAxios.post.mockReset();
});

afterEach(() => {
  localStorage.removeItem('gn-guide-registration-draft');
});

describe('GuideRegistrationWizard', () => {
  it('renders the five step indicators and registration heading', () => {
    renderWizard();
    expect(screen.getByText(/Guide registration/i)).toBeInTheDocument();
    expect(screen.getByText(/Join our community of authentic local experts/i)).toBeInTheDocument();
    for (const label of ['Basics', 'Profile', 'Experience', 'Documents', 'Preview & Submit']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('shows field-level validation errors on Basics when required fields are empty', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText(/First name is required./i)).toBeInTheDocument();
    expect(screen.getByText(/Last name is required./i)).toBeInTheDocument();
    expect(screen.getByText(/Email address is required./i)).toBeInTheDocument();
    expect(screen.getByText(/Region is required./i)).toBeInTheDocument();
  });

  it('advances from Basics to Profile when Basics is completed', () => {
    renderWizard();
    fireEvent.change(screen.getByLabelText(/First name/i), {
      target: { value: 'Pasang' },
    });
    fireEvent.change(screen.getByLabelText(/Last name/i), {
      target: { value: 'Sherpa' },
    });
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'pasang@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Region/i), {
      target: { value: 'Bagmati' },
    });
    fireEvent.change(screen.getByLabelText(/Create a password/i), {
      target: { value: 'Strong!Pass1' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: 'Strong!Pass1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText(/Display name/i)).toBeInTheDocument();
    expect(screen.queryByText(/First name/i)).not.toBeInTheDocument();
  });

  it('submits the application and shows the success screen', async () => {
    renderWizard();
    // Basics
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: 'Pasang' } });
    fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: 'Sherpa' } });
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'pasang@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Region/i), { target: { value: 'Bagmati' } });
    fireEvent.change(screen.getByLabelText(/Create a password/i), {
      target: { value: 'Strong!Pass1' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: 'Strong!Pass1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Profile
    fireEvent.change(screen.getByLabelText(/Display name/i), {
      target: { value: 'Pasang Sherpa' },
    });
    fireEvent.change(screen.getByLabelText(/Languages/i), { target: { value: 'Nepali, English' } });
    fireEvent.change(screen.getByLabelText(/Province/i), { target: { value: 'Bagmati' } });
    fireEvent.change(screen.getByLabelText(/Bio/i), {
      target: {
        value: 'I am a certified trekking guide with deep knowledge of the Annapurna region.',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Experience
    fireEvent.change(screen.getByLabelText(/Years of guiding experience/i), {
      target: { value: '8' },
    });
    fireEvent.change(screen.getByLabelText(/Areas of expertise/i), {
      target: { value: 'Trekking, Cultural tours' },
    });
    fireEvent.change(screen.getByLabelText(/Cities \/ areas covered/i), {
      target: { value: 'Kathmandu, Pokhara' },
    });
    fireEvent.change(screen.getByLabelText(/Guiding experience summary/i), {
      target: {
        value:
          'Eight years leading treks across the Himalayas, specializing in Annapurna and Everest regions.',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Documents - only NIN is frontend-required to advance
    fireEvent.change(screen.getByLabelText(/National ID number/i), {
      target: { value: '1234567890' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Preview & Submit - accept declarations then submit
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // terms
    fireEvent.click(checkboxes[1]); // privacy
    fireEvent.click(checkboxes[2]); // accuracy

    mockedAxios.post.mockResolvedValueOnce({ data: { id: 42 } });
    fireEvent.click(screen.getByRole('button', { name: /Submit application/i }));

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [url, body] = mockedAxios.post.mock.calls[0];
    expect(url).toContain('/guide-applications');
    expect(body.get('full_name')).toBe('Pasang Sherpa');
    expect(body.get('email')).toBe('pasang@example.com');
    expect(screen.getByText(/Application submitted/i)).toBeInTheDocument();
  });
});
