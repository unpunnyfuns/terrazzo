import { getPluginOptions } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import cssPlugin from '../src/index.js';

describe('plugin options introspection', () => {
  it('exposes the options object the factory was called with', () => {
    const plugin = cssPlugin({ legacyHex: true, filename: 'tokens.css' });
    expect(getPluginOptions(plugin)).toEqual({ legacyHex: true, filename: 'tokens.css' });
  });

  it('exposes an empty options object when the factory is called with no args', () => {
    const plugin = cssPlugin();
    expect(getPluginOptions(plugin)).toEqual({});
  });

  it('exposes an empty options object when the factory is called with `{}`', () => {
    const plugin = cssPlugin({});
    expect(getPluginOptions(plugin)).toEqual({});
  });

  it('roundtrips arbitrary plugin options including functions', () => {
    const transform = (): undefined => undefined;
    const plugin = cssPlugin({
      legacyHex: false,
      include: ['color.*'],
      exclude: ['color.legacy.*'],
      transform,
    });
    const opts = getPluginOptions(plugin);
    expect(opts).toMatchObject({
      legacyHex: false,
      include: ['color.*'],
      exclude: ['color.legacy.*'],
    });
    expect((opts as Record<string, unknown>).transform).toBe(transform);
  });
});
