# @aliou/vite-plugin-obsidian

## 0.3.0

### Minor Changes

- a109658: Raise the minimum Node.js version to 24 and support Vite 8. CSS extraction now goes through `build.lib.cssFileName`, which Vite 8 requires for the `cssFileName` option to take effect.

### Patch Changes

- cfc65bc: Use `output.codeSplitting: false` on Vite 8 instead of the deprecated `inlineDynamicImports: true` (same behavior: a single `main.js` chunk). Older Vite versions keep using `inlineDynamicImports`.

## 0.2.0

### Minor Changes

- d4a0d52: Match the CRX-style manifest API by requiring `obsidian({ manifest })` and allowing `defineManifest` to return manifest objects, promises, or Vite environment callbacks.
