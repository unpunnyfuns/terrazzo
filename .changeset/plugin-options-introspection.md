---
"@terrazzo/parser": minor
"@terrazzo/plugin-css": minor
"@terrazzo/plugin-token-listing": minor
---

Add `PLUGIN_OPTIONS` symbol slot + `getPluginOptions(plugin)` helper for downstream tooling that wants to inspect what each plugin was constructed with — config inspectors, alignment helpers (e.g. a Storybook addon keeping its preview build aligned with a production CLI build by reading the user's existing `terrazzo.config.ts`), content-hash inputs, IDE integrations.

```ts
// Plugin author opts in by writing the slot:
import { PLUGIN_OPTIONS, type Plugin } from '@terrazzo/parser';

export default function myPlugin(options: MyOptions = {}): Plugin {
  return {
    name: '@scope/my-plugin',
    [PLUGIN_OPTIONS]: options,
    async build() { ... },
  };
}

// Consumer reads via the helper:
import { getPluginOptions } from '@terrazzo/parser';
for (const plugin of config.plugins) {
  const opts = getPluginOptions(plugin);
  if (opts) console.log(`${plugin.name}:`, opts);
}
```

`@terrazzo/plugin-css` and `@terrazzo/plugin-token-listing` adopt the convention. Plugins that don't opt in see no behavioural change — the slot is optional and `getPluginOptions` returns `undefined` for them.

The slot is symbol-keyed (`Symbol.for('@terrazzo/plugin-options')`) so the public Plugin shape doesn't gain a `options` property name that could collide with existing third-party plugin types. `Symbol.for(...)` keeps the slot globally registered, so plugins shipped against compatible-but-different parser versions still expose options to a single inspection call.
