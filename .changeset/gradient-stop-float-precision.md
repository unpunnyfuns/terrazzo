---
"@terrazzo/token-tools": patch
---

Fix: gradient stop positions emitted by `transformGradient` no longer leak IEEE-754 representation artefacts. The prior `${100 * position}%` template-literal coercion produced strings like `55.00000000000001%` for a `0.55` stop. Stops are now rounded to 1/1000 — collapses the noise while preserving authored 8ths (`0.125`, `0.875`) and thirds (`33.333%`).
