---
"@aliou/vite-plugin-obsidian": patch
---

Use `output.codeSplitting: false` on Vite 8 instead of the deprecated `inlineDynamicImports: true` (same behavior: a single `main.js` chunk). Older Vite versions keep using `inlineDynamicImports`.
