import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
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

  it('is anchored directly beneath the fields in document flow', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(cardField('checkin'));

    const panel = screen.getByRole('dialog');
    // Anchored via normal document flow (absolute, top-full) inside the
    // relative wrapper - so it inherently scrolls one-for-one with the
    // fields and can never cross over them. No fixed positioning, no
    // inline top/left tracking, no portal.
    expect(panel.className).toMatch(/absolute/);
    expect(panel.className).toMatch(/top-full/);
    expect((panel as HTMLElement).style.position).not.toBe('fixed');
    expect((panel as HTMLElement).style.top).toBe('');
    expect((panel as HTMLElement).style.left).toBe('');
    // Panel renders after the field row inside the same relative wrapper.
    const wrapper = panel.parentElement!;
    expect(wrapper.className).toMatch(/relative/);
    const row = wrapper.firstElementChild!;
    expect(row.contains(cardField('checkin'))).toBe(true);
    expect(row.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps Clear dates and Close pinned visible while the months scroll', async () => {
    const localUser = userEvent.setup();
    render(<Harness />);
    await localUser.click(cardField('checkin'));

    const panel = screen.getByRole('dialog');
    const footer = screen.getByText('Clear dates').closest('div.flex')!;
    // Sticky bottom footer with a solid background, so the buttons stay
    // readable and clickable while the long month grid scrolls under them.
    expect(footer.className).toMatch(/sticky/);
    expect(footer.className).toMatch(/bottom-0/);
    expect(footer.className).toMatch(/bg-white/);
    expect(panel.className).toMatch(/overflow-y-auto/);
  });
});
