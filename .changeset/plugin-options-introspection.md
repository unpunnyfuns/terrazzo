---
"@terrazzo/parser": minor
"@terrazzo/plugin-css": minor
"@terrazzo/plugin-token-listing": minor
---

Add a `Plugin.options` field that plugins can populate with the option object their factory was called with. Lets downstream tooling (config inspectors, alignment helpers, content-hash inputs, custom config UIs) read what each plugin was constructed with — without cracking open the plugin's closure or asking authors to re-implement option resolution. Plugin authors opt in by passing through their resolved options object; consumers should treat the value as opaque per-plugin shape.

`@terrazzo/plugin-css` and `@terrazzo/plugin-token-listing` adopt the field — they expose the options they receive at construction time. Third-party plugins keep working as-is; the field is optional.
