import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookmarkButton } from '../../components/common/BookmarkButton';
import { useProfileStore } from '../../store/profileStore';

// Currency and cart are not involved, so only the router-free plain render.
describe('BookmarkButton', () => {
  beforeEach(() => {
    useProfileStore.setState({ profile: { travelPhotos: [], bookmarks: [] } });
  });

  it('adds the experience to bookmarks on first click', () => {
    render(
      <BookmarkButton
        id="exp-nagarkot-day-trip"
        title="Nagarkot Day Trip"
        city="Kathmandu"
        image="nagarkot.jpg"
        link="/city/kathmandu/experience/nagarkot-day-trip"
      />
    );

    const button = screen.getByRole('button', { name: /bookmark nagarkot day trip/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);

    expect(useProfileStore.getState().profile.bookmarks).toEqual([
      expect.objectContaining({
        id: 'exp-nagarkot-day-trip',
        title: 'Nagarkot Day Trip',
        city: 'Kathmandu',
        image: 'nagarkot.jpg',
        link: '/city/kathmandu/experience/nagarkot-day-trip',
      }),
    ]);
  });

  it('removes the bookmark on the next click and reflects the saved state', () => {
    useProfileStore.setState({
      profile: {
        travelPhotos: [],
        bookmarks: [
          {
            id: 'exp-nagarkot-day-trip',
            title: 'Nagarkot Day Trip',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    });

    render(<BookmarkButton id="exp-nagarkot-day-trip" title="Nagarkot Day Trip" />);

    const button = screen.getByRole('button', { name: /remove nagarkot day trip/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(button);
    expect(useProfileStore.getState().profile.bookmarks).toHaveLength(0);
  });

  it('never navigates the card underneath', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <BookmarkButton id="exp-x" title="Test" />
      </div>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
