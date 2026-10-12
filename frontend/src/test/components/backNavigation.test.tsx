import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import BackNavigationTracker from '../../components/routing/BackNavigationTracker';
import {
  resetBackNavigationState,
  resolveBackTarget,
} from '../../utils/backNavigation';
import { useGoBack } from '../../utils/backNavigation';

const HOME = '/';
const OUTDOOR = '/outdoor-activities';
const CITY = '/city/pokhara';
const EXPERIENCE = '/city/pokhara/experience/annapurna-base-camp-trek';
const LEGACY_EXPERIENCE = '/experience/annapurna-circuit-trek';
const BECOME_HOST = '/become-host';
const HOST_APPLICATION = '/host-application';

const Harness: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  return (
    <div>
      <span data-testid="pathname">{window.location.pathname}</span>
      <button type="button" onClick={() => navigate(OUTDOOR)}>
        go outdoor
      </button>
      <button type="button" onClick={() => navigate(CITY)}>
        go city
      </button>
      <button type="button" onClick={() => navigate(EXPERIENCE)}>
        go experience
      </button>
      <button type="button" onClick={() => navigate(BECOME_HOST)}>
        go become-host
      </button>
      <button type="button" onClick={() => navigate(HOST_APPLICATION)}>
        go host-application
      </button>
      <button type="button" onClick={() => window.history.back()}>
        browser back
      </button>
      <button type="button" onClick={goBack}>
        app back
      </button>
    </div>
  );
};

const renderApp = () =>
  render(
    <BrowserRouter>
      <BackNavigationTracker />
      <Routes>
        <Route path="/experience/:id" element={<Navigate to={EXPERIENCE} replace />} />
        <Route path="*" element={<Harness />} />
      </Routes>
    </BrowserRouter>,
  );

const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const currentPath = () => screen.getByTestId('pathname').textContent;

describe('resolveBackTarget', () => {
  it('resolves a city experience page to its city landing page', () => {
    expect(resolveBackTarget(EXPERIENCE)).toBe(CITY);
    expect(resolveBackTarget('/city/kathmandu/experience/treasures-of-kathmandu-buddhism')).toBe(
      '/city/kathmandu',
    );
  });

  it('resolves the city experiences listing to its city landing page', () => {
    expect(resolveBackTarget('/city/pokhara/experiences')).toBe(CITY);
  });

  it('resolves local profile sub-pages to the profile page', () => {
    expect(resolveBackTarget('/local/42/portfolio')).toBe('/local/42');
    expect(resolveBackTarget('/local/42/contact')).toBe('/local/42');
  });

  it('resolves guide sub-pages to their nearest registered parent', () => {
    expect(resolveBackTarget('/guide/listings/7/edit')).toBe('/guide/listings');
    expect(resolveBackTarget('/guide/proposals/7/edit')).toBe('/guide/proposals/7');
  });

  it('resolves category experience pages to their category listing', () => {
    expect(resolveBackTarget('/food-tours/culture/kathmandu-street-food')).toBe('/food-tours');
    expect(resolveBackTarget('/cooking-classes/experience/momo-making')).toBe('/cooking-classes');
  });

  it('has no fallback target for level-one pages', () => {
    expect(resolveBackTarget(HOME)).toBeUndefined();
    expect(resolveBackTarget(CITY)).toBeUndefined();
    expect(resolveBackTarget('/most-popular')).toBeUndefined();
  });

  it('has no fallback target for dynamic pages whose parent is not a route', () => {
    expect(resolveBackTarget('/local/42')).toBeUndefined();
    expect(resolveBackTarget('/bookings')).toBeUndefined();
  });

  it('ignores trailing slashes', () => {
    expect(resolveBackTarget(`${CITY}/`)).toBeUndefined();
    expect(resolveBackTarget(`${EXPERIENCE}/`)).toBe(CITY);
  });
});

describe('back buttons', () => {
  beforeEach(() => {
    resetBackNavigationState();
    window.sessionStorage.clear();
    window.history.replaceState(null, '', HOME);
  });

  it('returns to the city page the user came from', async () => {
    renderApp();
    click('go city');
    click('go experience');

    expect(currentPath()).toBe(EXPERIENCE);

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(CITY));
  });

  it('returns to the recent last page, not the parent route, when opened elsewhere', async () => {
    renderApp();
    click('go outdoor');
    click('go experience');

    expect(currentPath()).toBe(EXPERIENCE);

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(OUTDOOR));
  });

  it('keeps unwinding after returning from an experience to the listing, instead of looping back to it', async () => {
    renderApp();
    click('go outdoor');
    click('go experience');

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(OUTDOOR));

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(HOME));
  });

  it('unwinds the host application wizard back through the trail instead of bouncing back to the become-host page', async () => {
    renderApp();
    click('go become-host');
    click('go host-application');

    // The wizard's Back button must leave via the trail, not re-push
    // /become-host, otherwise the trail keeps a duplicate entry and the
    // become-host Back button returns straight to the wizard.
    click('app back');

    await waitFor(() => expect(currentPath()).toBe(BECOME_HOST));

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(HOME));
  });

  it('falls back to the parent page when the experience page was opened directly', async () => {
    window.history.replaceState(null, '', EXPERIENCE);
    renderApp();

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(CITY));
  });

  it('stays on the page when there is no previous page and no parent route', async () => {
    renderApp();

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(HOME));
    expect(window.location.pathname).toBe(HOME);
  });

  it('ignores a replaced legacy URL in the trail', async () => {
    window.history.replaceState(null, '', LEGACY_EXPERIENCE);
    renderApp();

    await waitFor(() => expect(currentPath()).toBe(EXPERIENCE));

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(CITY));
  });

  it('continues further back after the browser back button rewinds the trail', async () => {
    renderApp();
    click('go city');
    click('go experience');

    click('browser back');

    await waitFor(() => expect(currentPath()).toBe(CITY));

    click('app back');

    await waitFor(() => expect(currentPath()).toBe(HOME));
  });
});
