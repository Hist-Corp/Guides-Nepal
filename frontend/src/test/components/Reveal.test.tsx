import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Reveal from '../../components/common/Reveal';

type ObserverCallback = (
  entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting' | 'target'>>
) => void;

interface FakeObserverEntry {
  callback: ObserverCallback;
  observed: Element[];
  disconnected: boolean;
}

// The global setup stubs IntersectionObserver as a no-op, so capture the
// callback here and drive the observer from the test.
const observers: FakeObserverEntry[] = [];

class FakeIntersectionObserver {
  private entry: FakeObserverEntry;

  constructor(callback: ObserverCallback) {
    this.entry = { callback, observed: [], disconnected: false };
    observers.push(this.entry);
  }

  observe(target: Element) {
    this.entry.observed.push(target);
  }

  unobserve() {
    // no-op
  }

  disconnect() {
    this.entry.disconnected = true;
  }
}

/** Simulate the element scrolling into the viewport. */
function enterViewport(wrapper: HTMLElement) {
  act(() => {
    observers[0].callback([{ isIntersecting: true, target: wrapper }]);
  });
}

describe('Reveal', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  it('renders its children', () => {
    render(
      <Reveal>
        <p>Hello animations</p>
      </Reveal>
    );
    expect(screen.getByText('Hello animations')).toBeInTheDocument();
  });

  it('stays hidden until it enters the viewport, then plays the entrance animation', () => {
    const { container } = render(
      <Reveal delay={120}>
        <p>Revealed</p>
      </Reveal>
    );
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper.className).toContain('opacity-0');
    expect(wrapper.className).not.toContain('animate-');
    expect(wrapper.style.animationDelay).toBe('120ms');

    enterViewport(wrapper);

    expect(wrapper.className).toContain('animate-fade-in-up');
    expect(wrapper.className).not.toContain('opacity-0');
  });

  it('observes the rendered element and disconnects after revealing', () => {
    const { container } = render(<Reveal>content</Reveal>);
    const wrapper = container.firstElementChild as HTMLElement;

    expect(observers[0].observed).toContain(wrapper);
    expect(observers[0].disconnected).toBe(false);

    enterViewport(wrapper);

    expect(observers[0].disconnected).toBe(true);
  });

  it('supports directional and zoom variants', () => {
    const { container } = render(
      <Reveal variant="zoom">
        <span>zoom content</span>
      </Reveal>
    );
    const wrapper = container.firstElementChild as HTMLElement;

    enterViewport(wrapper);

    expect(wrapper.className).toContain('animate-zoom-in');
  });

  it('renders as a list item when `as="li"` is used', () => {
    render(
      <Reveal as="li" variant="left">
        <span>list item content</span>
      </Reveal>
    );
    expect(screen.getByText('list item content').closest('li')).not.toBeNull();
  });

  it('reveals immediately when the visitor prefers reduced motion', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    );

    const { container } = render(
      <Reveal variant="left">
        <p>no motion</p>
      </Reveal>
    );
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper.className).toContain('animate-fade-in-left');
    expect(wrapper.className).not.toContain('opacity-0');
    expect(observers).toHaveLength(0);

    matchMediaSpy.mockRestore();
  });
});
