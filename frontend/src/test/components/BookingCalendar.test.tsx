import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BookingCalendar } from '../../components/common/BookingCalendar';

/** Renders the calendar and tracks the dates it commits. */
function Harness({ initialIn = '', initialOut = '' }) {
  const [range, setRange] = useState({ checkIn: initialIn, checkOut: initialOut });
  return (
    <BookingCalendar
      checkIn={range.checkIn}
      checkOut={range.checkOut}
      onChange={(checkIn, checkOut) => setRange({ checkIn, checkOut })}
    />
  );
}

const dialog = () => screen.getByRole('dialog');

/**
 * The card fields exist twice (a mobile and a desktop copy, one hidden by
 * CSS), so they are addressed by id. The popup uses a `-panel-` id prefix
 * and is portaled outside the container, so these never match it.
 */
const cardField = (field: 'checkin' | 'checkout') =>
  document.querySelector<HTMLInputElement>(`#booking-desktop-${field}`)!;

/** A date field rendered in the popup header, addressed by its field name. */
const panelField = (field: 'checkin' | 'checkout') =>
  within(dialog()).getByLabelText(
    field === 'checkin' ? 'Check-in date, format DD/MM/YYYY' : 'Check-out date, format DD/MM/YYYY'
  );

describe('BookingCalendar', () => {
  it('shows both check-in and check-out fields on the card before any interaction', () => {
    render(<Harness />);

    expect(cardField('checkin')).toBeInTheDocument();
    expect(cardField('checkout')).toBeInTheDocument();
    expect(cardField('checkin')).toHaveAttribute('placeholder', 'Add date');
    expect(cardField('checkout')).toHaveAttribute('placeholder', 'Add date');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps both fields inside the popup, with the active one outlined', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(cardField('checkin'));

    // Check-in and check-out both stay on screen, check-in being active.
    expect(within(dialog()).getByText('Check-in')).toBeInTheDocument();
    expect(within(dialog()).getByText('Check-out')).toBeInTheDocument();
    expect(panelField('checkin')).toHaveAttribute('placeholder', 'DD/MM/YYYY');
    // The inactive check-out box keeps the "Add date" prompt.
    expect(panelField('checkout')).toHaveAttribute('placeholder', 'Add date');
  });

  it('moves the active outline to check-out when it is tapped', async () => {
    const user = userEvent.setup();
    render(<Harness initialIn="2026-10-05" />);

    await user.click(cardField('checkout'));

    expect(panelField('checkout')).toHaveAttribute('placeholder', 'DD/MM/YYYY');
    expect(panelField('checkin')).toHaveValue('05/10/2026');
  });

  it('falls back to the check-in field when check-out is tapped with no check-in', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(cardField('checkout'));

    expect(panelField('checkin')).toHaveAttribute('placeholder', 'DD/MM/YYYY');
  });

  it('formats typed digits day-first as DD/MM/YYYY', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(cardField('checkin'));
    await user.type(panelField('checkin'), '05102026');

    expect(panelField('checkin')).toHaveValue('05/10/2026');
  });

  it('reads DD/MM/YYYY back as 5 October, not 10 May, and moves on to check-out', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(cardField('checkin'));
    await user.type(panelField('checkin'), '05102026{Enter}');

    // 05/10/2026 is 5 October, and committing it advances to check-out.
    await waitFor(() => expect(cardField('checkin')).toHaveValue('05/10/2026'));
    expect(within(dialog()).getByText('Check-out')).toBeInTheDocument();
  });

  it('rejects an impossible typed date and keeps the popup on check-in', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(cardField('checkin'));
    await user.type(panelField('checkin'), '30022026{Enter}');

    expect(await screen.findByText('Enter a valid date as DD/MM/YYYY.')).toBeInTheDocument();
    expect(panelField('checkin')).toHaveAttribute('aria-invalid', 'true');
  });

  it('stays fully on screen, with a constant height, while the page scrolls', async () => {
    // jsdom has no layout engine, so stand in for the page: a card at a fixed
    // offset in the document whose viewport rect slides up as the page
    // scrolls, in an 800px-tall window. The calendar's natural height (456)
    // deliberately does NOT fit under the card at the top of the page, which
    // is the situation that used to make the panel resize on every scroll
    // frame and clipped its Clear/Close footer off the bottom of the window.
    let scrollY = 0;
    const rectSpy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: Element) {
        const top = 300 - scrollY;
        return {
          top,
          bottom: top + 80,
          left: 40,
          right: 720,
          width: 680,
          height: 80,
          x: 40,
          y: top,
          toJSON: () => ({}),
        } as DOMRect;
      });
    const heightSpy = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(456);
    const innerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });

    try {
      render(<Harness />);
      await userEvent.setup().click(cardField('checkin'));

      const panel = dialog();
      const top = () => Number.parseFloat(panel.style.top);
      const scrollTo = (next: number) => {
        scrollY = next;
        window.dispatchEvent(new Event('scroll'));
      };

      // The fields end 388px down the window and the panel is 456px tall, so
      // hanging below them would run it 164px past the bottom of the screen.
      // Instead it lifts until its bottom sits 8px above the viewport edge —
      // no height cap, so the footer and both months stay reachable.
      await waitFor(() => expect(top()).toBe(336));
      expect(top() + 456).toBe(792);
      expect(panel.style.maxHeight).toBe('');

      // Scrolled down there is room under the fields again, so the panel
      // docks 8px beneath them and tracks them one-for-one — moving by
      // exactly as much as they did, without ever changing height.
      scrollTo(120);
      await waitFor(() => expect(top()).toBe(388 - scrollY));
      let lastTop = top();
      for (const delta of [90, 90, 60, -40, -60, -30, 30]) {
        scrollTo(scrollY + delta);
        await waitFor(() => expect(top()).toBe(388 - scrollY));
        expect(top() - lastTop).toBe(-delta);
        // Same height throughout, so it never appears to shrink and grow.
        expect(panel.style.maxHeight).toBe('');
        expect(top() + 456).toBeLessThanOrEqual(792);
        lastTop = top();
      }

      // Back at the top of the page it lifts again instead of overflowing.
      scrollTo(0);
      await waitFor(() => expect(top()).toBe(336));
      expect(top() + 456).toBe(792);
    } finally {
      heightSpy.mockRestore();
      rectSpy.mockRestore();
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight });
    }
  });
});
