import { describe, expect, it } from 'vitest';
import { guideProfileHref } from '../../utils/guides';

describe('guideProfileHref', () => {
  it('links the catalog profile a guide actually has', () => {
    expect(guideProfileHref({ slug: 'apicha' })).toBe('/guidesprofile/apicha');
  });

  it('offers no link for an account-only guide with nothing to open', () => {
    expect(guideProfileHref({ slug: null })).toBeNull();
    expect(guideProfileHref({})).toBeNull();
    expect(guideProfileHref({ slug: '   ' })).toBeNull();
  });
});
