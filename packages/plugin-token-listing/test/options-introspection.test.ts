import { describe, expect, it } from 'vitest';
import tokenListingPlugin from '../src/index.js';

describe('plugin.options introspection', () => {
  it('exposes the options object the factory was called with', () => {
    const plugin = tokenListingPlugin({
      filename: 'tokens.listing.json',
      platforms: { css: { name: '@terrazzo/plugin-css' } },
    });
    expect(plugin.options).toEqual({
      filename: 'tokens.listing.json',
      platforms: { css: { name: '@terrazzo/plugin-css' } },
    });
  });

  it('roundtrips function-shaped options (previewValue, subtype hooks)', () => {
    const previewValue = (): undefined => undefined;
    const plugin = tokenListingPlugin({ previewValue });
    expect((plugin.options as Record<string, unknown>).previewValue).toBe(previewValue);
  });
});
