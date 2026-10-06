import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileBookingSheet } from '../../components/common/MobileBookingSheet';
import { useUIStore } from '../../store/uiStore';

// Price renders through useCurrency, which requires a provider; mock Price
// itself so the test stays focused on the sheet's behavior.
vi.mock('../../components/common/Price', () => ({
  Price: ({ amount }: { amount: number }) => <span>${amount}</span>,
}));

// The month grid is covered by BookingCalendar's own tests; here the sheet
// only needs to forward its `singleDate` flag to the calendar.
vi.mock('../../components/common/BookingCalendar', () => ({
  BookingCalendar: ({ single }: { single?: boolean }) => (
    <div data-testid="sheet-calendar" data-single={single ? 'true' : 'false'} />
  ),
}));

const baseProps = {
  open: true,
  onClose: vi.fn(),
  pricePerPerson: 45,
  rating: 4.9,
  reviews: 124,
  checkIn: '',
  checkOut: '',
  onDateChange: vi.fn(),
  guests: 1,
  onGuestsChange: vi.fn(),
  bookingTime: '09:00',
  onTimeChange: vi.fn(),
  selectedGuide: null,
  onSelectGuide: vi.fn(),
  onConfirm: vi.fn(),
};

describe('MobileBookingSheet', () => {
  beforeEach(() => {
    useUIStore.setState({ isBookingSheetOpen: false });
  });

  it('renders nothing when closed', () => {
    render(<MobileBookingSheet {...baseProps} open={false} guides={[]} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useUIStore.getState().isBookingSheetOpen).toBe(false);
  });

  it('flags the uiStore while open (so the support widget hides) and clears on unmount', () => {
    const { unmount } = render(<MobileBookingSheet {...baseProps} guides={[]} />);
    expect(useUIStore.getState().isBookingSheetOpen).toBe(true);
    unmount();
    expect(useUIStore.getState().isBookingSheetOpen).toBe(false);
  });

  it('shows every booking section: dates, start time, guests, guide', () => {
    render(
      <MobileBookingSheet
        {...baseProps}
        guides={[{ id: 1, name: 'Apicha', image: 'a.jpg', rating: 4.9 }]}
        selectedGuide={{ id: 1, name: 'Apicha', image: 'a.jpg', rating: 4.9 }}
      />
    );
    const dialog = screen.getByRole('dialog', { name: /configure booking/i });
    expect(dialog).toBeInTheDocument();
    for (const section of [
      /select dates/i,
      /select start time/i,
      /select guests/i,
      /select guide/i,
    ]) {
      expect(screen.getAllByLabelText(section).length).toBeGreaterThan(0);
    }
    expect(screen.getByText('Apicha')).toBeInTheDocument();
  });

  it('calls onConfirm from the CTA and onClose from the X / Escape', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <MobileBookingSheet {...baseProps} onClose={onClose} onConfirm={onConfirm} guides={[]} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /close booking sheet/i }));
    expect(onClose).toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('shows the inline validation error above the CTA', () => {
    render(<MobileBookingSheet {...baseProps} error="Please select a check-in date" guides={[]} />);
    expect(screen.getByText('Please select a check-in date')).toBeInTheDocument();
  });

  it('replaces the form with a confirmation view and Done button when confirmed', () => {
    const onClose = vi.fn();
    render(
      <MobileBookingSheet
        {...baseProps}
        confirmed
        onClose={onClose}
        confirmedSummary={<p>Guide: Apicha</p>}
        guides={[]}
      />
    );
    expect(screen.getByText(/booking requested/i)).toBeInTheDocument();
    expect(screen.getByText('Guide: Apicha')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Book Now' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('passes singleDate through to the calendar for single-day experiences', () => {
    const { rerender } = render(<MobileBookingSheet {...baseProps} guides={[]} singleDate />);
    expect(screen.getByTestId('sheet-calendar')).toHaveAttribute('data-single', 'true');

    rerender(<MobileBookingSheet {...baseProps} guides={[]} />);
    expect(screen.getByTestId('sheet-calendar')).toHaveAttribute('data-single', 'false');
  });

  it('shows the full price breakdown (rate x guests x days, fees, total) for date ranges', () => {
    render(
      <MobileBookingSheet
        {...baseProps}
        checkIn="2026-10-15"
        checkOut="2026-11-11"
        guests={4}
        guides={[]}
      />
    );
    // $45 x 4 guests x 27 days + $15 cleaning + $0 service = $4875
    expect(screen.getByText(/x 4 guests/)).toBeInTheDocument();
    expect(screen.getByText(/x 27 days/)).toBeInTheDocument();
    expect(screen.getByText('$4860')).toBeInTheDocument();
    expect(screen.getByText('Cleaning fee')).toBeInTheDocument();
    expect(screen.getByText('$15')).toBeInTheDocument();
    expect(screen.getByText('Service fee')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$4875')).toBeInTheDocument();
  });

  it('honours cleaningFee/serviceFee overrides in the breakdown', () => {
    render(
      <MobileBookingSheet
        {...baseProps}
        checkIn="2026-10-15"
        checkOut="2026-10-16"
        cleaningFee={20}
        serviceFee={5}
        guides={[]}
      />
    );
    expect(screen.getByText('$20')).toBeInTheDocument();
    expect(screen.getByText('$5')).toBeInTheDocument();
    expect(screen.getByText('$70')).toBeInTheDocument(); // 45 x 1 x 1 + 20 + 5
  });

  it('shows the guests subtotal line for single-day experiences only when guests > 1', () => {
    const { rerender } = render(
      <MobileBookingSheet {...baseProps} singleDate guests={1} guides={[]} />
    );
    expect(screen.queryByText(/× 1 guests/)).toBeNull();
    expect(screen.queryByText('Cleaning fee')).toBeNull();

    rerender(<MobileBookingSheet {...baseProps} singleDate guests={3} guides={[]} />);
    expect(screen.getByText(/× 3 guests/)).toBeInTheDocument();
    expect(screen.getByText('$135')).toBeInTheDocument(); // 45 x 3
  });
});
