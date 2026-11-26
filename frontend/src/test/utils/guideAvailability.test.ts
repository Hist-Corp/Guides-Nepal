import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  keepSelectedGuide,
  useGuidesAvailableOnDate,
  type GuideAvailabilityQuery,
} from '../../utils/guides';

/** Minimal stand-in for the availability endpoint's response. */
const answer = (ids: string[]) => ({ ok: true, json: async () => ({ guide_ids: ids }) });

const query = (date: string): GuideAvailabilityQuery => ({
  accessToken: 'token',
  experienceId: 1,
  date,
  guideIds: [1, 2],
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useGuidesAvailableOnDate', () => {
  it('keeps the cards already on screen while a new date is checked', async () => {
    let resolveNext: (value: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveNext = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => answer(['1']))
      .mockImplementationOnce(() => pending);
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(
      (props: GuideAvailabilityQuery) => useGuidesAvailableOnDate(props),
      { initialProps: query('2026-12-16') }
    );
    await waitFor(() => expect(result.current.status).toBe('verified'));
    expect([...(result.current.ids ?? [])]).toEqual(['1']);

    rerender(query('2026-12-17'));

    // Still checking the new date: the answer for the old one stays on screen
    // instead of blanking into the "Checking…" line and dropping the pick.
    expect(result.current.status).toBe('checking');
    expect([...(result.current.ids ?? [])]).toEqual(['1']);

    await act(async () => {
      resolveNext(answer(['2']));
      await pending;
    });
    await waitFor(() => expect(result.current.status).toBe('verified'));
    expect([...(result.current.ids ?? [])]).toEqual(['2']);
  });

  it('shows no guides and offers a retry when the check could not be completed', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useGuidesAvailableOnDate(query('2026-12-16')));
    await waitFor(() => expect(result.current.status).toBe('failed'));
    expect(result.current.ids?.size).toBe(0);

    fetchMock.mockResolvedValueOnce(answer(['2']));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('verified'));
    expect([...(result.current.ids ?? [])]).toEqual(['2']);
  });

  it('does not ask the server before a date is chosen', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useGuidesAvailableOnDate({ ...query(''), date: '' }));

    expect(result.current.status).toBe('unfiltered');
    expect(result.current.ids).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('keepSelectedGuide', () => {
  const apicha = { id: 1, name: 'Apicha' };
  const priya = { id: 9001, name: 'Priya' };

  it('keeps the traveller guide while the check is pending or failed', () => {
    for (const status of ['checking', 'failed'] as const) {
      expect(keepSelectedGuide([], apicha, status)).toBe(apicha);
      expect(keepSelectedGuide([priya], apicha, status)).toBe(apicha);
    }
  });

  it('keeps a guide the server still lists', () => {
    expect(keepSelectedGuide([priya, apicha], apicha, 'verified')).toBe(apicha);
    expect(keepSelectedGuide([apicha], apicha, 'unfiltered')).toBe(apicha);
  });

  it('drops the guide only once the server says they are not available', () => {
    expect(keepSelectedGuide([priya], apicha, 'verified')).toBe(priya);
    expect(keepSelectedGuide([], apicha, 'verified')).toBeNull();
  });

  it('keeps the guide just booked even when the check excludes them', () => {
    expect(keepSelectedGuide([priya], apicha, 'verified', apicha.id)).toBe(apicha);
  });
});
