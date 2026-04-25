---
"@terrazzo/parser": minor
"@terrazzo/plugin-css": minor
"@terrazzo/plugin-token-listing": minor
---

Expose plugin options for downstream tooling that needs to introspect what each plugin was constructed with — config inspectors, alignment helpers (e.g. a Storybook addon keeping its preview build aligned with a production CLI build by reading the user's existing `terrazzo.config.ts`), content-hash inputs, IDE integrations.

Two layers, both opt-in and backwards compatible:

- **`Plugin.options`** — a new optional field on the `Plugin` type. Plugin authors populate it by passing through the resolved options object their factory received. Consumers treat it as opaque per-plugin shape. `@terrazzo/plugin-css` and `@terrazzo/plugin-token-listing` adopt the convention.
- **`PluginEntry` tuple form in `Config.plugins`** — `defineConfig` now accepts `[factory, options]` tuples alongside plain `Plugin` objects. The factory is invoked with the options at config-resolution time, and the options are attached to the resulting `Plugin.options` if the plugin didn't populate it itself. This lets users gain introspection on plugins that haven't (yet) opted in by spelling out the construction in tuple form:
  ```ts
  defineConfig({
    plugins: [
      css({ legacyHex: true }),                    // existing — closure-trapped
      [swift, { catalogName: 'Tokens' }],          // new — options visible to tooling
    ],
  });
  ```

Plugins that opt in via `Plugin.options` work transparently (no user-side change). Plugins that haven't opted in still work unchanged when called the normal way; users who want introspection on those can write the tuple form. Existing `plugins: Plugin[]` configs continue to work without modification.
