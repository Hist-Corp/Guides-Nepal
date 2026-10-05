import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StickyBarPortal } from '../../components/common/StickyBarPortal';

describe('StickyBarPortal', () => {
  it('renders children into document.body, outside the source tree', () => {
    const { container, getByTestId } = render(
      <div>
        <StickyBarPortal>
          <div data-testid="bar">bar</div>
        </StickyBarPortal>
      </div>
    );
    const bar = getByTestId('bar');
    expect(bar.parentElement).toBe(document.body);
    expect(container.querySelector('[data-testid="bar"]')).toBeNull();
  });

  it('flags body[data-sticky-bar] while mounted and removes it on unmount', () => {
    expect(document.body.hasAttribute('data-sticky-bar')).toBe(false);
    const { unmount } = render(
      <StickyBarPortal>
        <div data-testid="bar" />
      </StickyBarPortal>
    );
    expect(document.body.getAttribute('data-sticky-bar')).toBe('true');
    unmount();
    expect(document.body.hasAttribute('data-sticky-bar')).toBe(false);
  });

  it('keeps the flag until the last of multiple bars unmounts', () => {
    const a = render(
      <StickyBarPortal>
        <div data-testid="a" />
      </StickyBarPortal>
    );
    const b = render(
      <StickyBarPortal>
        <div data-testid="b" />
      </StickyBarPortal>
    );
    a.unmount();
    expect(document.body.hasAttribute('data-sticky-bar')).toBe(true);
    b.unmount();
    expect(document.body.hasAttribute('data-sticky-bar')).toBe(false);
  });
});
