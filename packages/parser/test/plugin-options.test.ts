import { describe, expect, it } from 'vitest';
import { getPluginOptions, PLUGIN_OPTIONS, type Plugin } from '../src/types.js';

describe('PLUGIN_OPTIONS / getPluginOptions', () => {
  it('reads the options slot from a plugin that opted in', () => {
    const plugin: Plugin = {
      name: 'opt-in',
      [PLUGIN_OPTIONS]: { legacyHex: true, include: ['color.*'] },
    };
    expect(getPluginOptions(plugin)).toEqual({ legacyHex: true, include: ['color.*'] });
  });

  it('returns undefined for a plugin that did not opt in', () => {
    const plugin: Plugin = { name: 'no-opt-in' };
    expect(getPluginOptions(plugin)).toBeUndefined();
  });

  it('returns undefined when the slot is null', () => {
    const plugin = {
      name: 'nullish',
      [PLUGIN_OPTIONS]: null,
    } as unknown as Plugin;
    expect(getPluginOptions(plugin)).toBeUndefined();
  });

  it('uses Symbol.for so plugins shipped against compatible parser versions still resolve', () => {
    // A plugin that grabs the symbol via the global registry rather
    // than importing — this is the cross-version compatibility
    // contract callers rely on.
    const externalKey = Symbol.for('@terrazzo/plugin-options');
    expect(externalKey).toBe(PLUGIN_OPTIONS);
    const plugin = {
      name: 'cross-version',
      [externalKey]: { ok: true },
    } as unknown as Plugin;
    expect(getPluginOptions(plugin)).toEqual({ ok: true });
  });

  it('hides options from the public Plugin shape (indexed access only)', () => {
    // The Plugin type's `[PLUGIN_OPTIONS]` slot is reachable only via
    // the symbol — `plugin.options` is not part of the type, so
    // consumers can't accidentally read a different field.
    const plugin: Plugin = { name: 'shape', [PLUGIN_OPTIONS]: { x: 1 } };
    // @ts-expect-error — `options` is intentionally not on Plugin
    expect(plugin.options).toBeUndefined();
    expect(getPluginOptions(plugin)).toEqual({ x: 1 });
  });
});
