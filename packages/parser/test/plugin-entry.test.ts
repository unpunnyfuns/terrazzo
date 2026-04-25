import { describe, expect, it } from 'vitest';
import defineConfig from '../src/config.js';
import type { Plugin, PluginFactory } from '../src/types.js';

const cwd = new URL('file:///');

describe('plugin entry resolution', () => {
  it('accepts plain Plugin objects (existing behavior)', () => {
    const plugin: Plugin = { name: 'inline', options: { foo: 'bar' } };
    const config = defineConfig({ plugins: [plugin] }, { cwd });
    // coreLintPlugin is appended at the end; first entry stays ours.
    expect(config.plugins[0]).toBe(plugin);
    expect(config.plugins[0]!.options).toEqual({ foo: 'bar' });
  });

  it('resolves a [factory, options] tuple by invoking the factory with the options', () => {
    const factory: PluginFactory = (options) => ({ name: 'tuple-built', options });
    const config = defineConfig({ plugins: [[factory, { legacyHex: true }]] }, { cwd });
    expect(config.plugins[0]!.name).toBe('tuple-built');
    expect(config.plugins[0]!.options).toEqual({ legacyHex: true });
  });

  it('attaches options from the tuple when the plugin does not populate options itself', () => {
    const factory: PluginFactory = () => ({ name: 'no-options-plugin' });
    const config = defineConfig({ plugins: [[factory, { include: ['color.*'] }]] }, { cwd });
    expect(config.plugins[0]!.options).toEqual({ include: ['color.*'] });
  });

  it("preserves the plugin's own options when the plugin populates them", () => {
    const factory: PluginFactory = (passed) => ({
      name: 'self-aware',
      // Plugin itself decides what to expose — could be a transformed
      // shape, defaults applied, etc. Tuple shouldn't clobber it.
      options: { ...(passed as Record<string, unknown>), normalised: true },
    });
    const config = defineConfig(
      { plugins: [[factory, { legacyHex: false }]] },
      { cwd },
    );
    expect(config.plugins[0]!.options).toEqual({ legacyHex: false, normalised: true });
  });

  it('errors when the tuple\'s first element is not a function', () => {
    const errors: string[] = [];
    const logger = {
      level: 'error' as const,
      // biome-ignore lint/suspicious/noExplicitAny: minimal logger stub
      error: (entry: any) => errors.push(entry.message),
      // biome-ignore lint/suspicious/noExplicitAny: minimal logger stub
      warn: (_: any) => {},
      // biome-ignore lint/suspicious/noExplicitAny: minimal logger stub
      info: (_: any) => {},
      // biome-ignore lint/suspicious/noExplicitAny: minimal logger stub
      debug: (_: any) => {},
      // biome-ignore lint/suspicious/noExplicitAny: minimal logger stub
      log: (_: any) => {},
      flush: () => {},
    };
    defineConfig(
      // biome-ignore lint/suspicious/noExplicitAny: testing invalid input shape
      { plugins: [['not-a-factory' as any, {}]] },
      // biome-ignore lint/suspicious/noExplicitAny: minimal logger stub
      { logger: logger as any, cwd },
    );
    expect(errors.some((m) => m.includes('first item must be a function'))).toBe(true);
  });

  it('mixes plain plugins and tuple plugins in the same array', () => {
    const factoryA: PluginFactory = (options) => ({ name: 'A', options });
    const plain: Plugin = { name: 'B', options: { plain: true } };
    const config = defineConfig(
      { plugins: [[factoryA, { tuple: true }], plain] },
      { cwd },
    );
    expect(config.plugins[0]!.name).toBe('A');
    expect(config.plugins[0]!.options).toEqual({ tuple: true });
    expect(config.plugins[1]!.name).toBe('B');
    expect(config.plugins[1]!.options).toEqual({ plain: true });
  });
});
