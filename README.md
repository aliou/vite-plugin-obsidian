# @aliou/vite-plugin-obsidian

Vite plugin for building Obsidian plugins.

## Install

```bash
npm install -D @aliou/vite-plugin-obsidian
```

## Usage

Create a `manifest.config.ts` in your project root:

```typescript
// manifest.config.ts
import { defineManifest } from "@aliou/vite-plugin-obsidian";

export default defineManifest({
  id: "my-plugin",
  name: "My Plugin",
  version: "1.0.0",
  minAppVersion: "1.0.0",
  description: "A cool plugin",
  author: "Your Name",
});
```

Then import the manifest in your Vite config and pass it to the plugin:

```typescript
// vite.config.ts
import { obsidian } from "@aliou/vite-plugin-obsidian";
import { defineConfig } from "vite";
import manifest from "./manifest.config";

export default defineConfig({
  plugins: [obsidian({ manifest })],
});
```

This mirrors the `@crxjs/vite-plugin` API. `defineManifest` also accepts a promise or a Vite config-env callback:

```typescript
import { defineManifest } from "@aliou/vite-plugin-obsidian";

export default defineManifest((env) => ({
  id: env.mode === "development" ? "my-plugin-dev" : "my-plugin",
  name: "My Plugin",
  version: "1.0.0",
  minAppVersion: "1.0.0",
  description: "A cool plugin",
  author: "Your Name",
}));
```

## What it does

- Sets Vite to library mode with CommonJS output (Obsidian loads plugins as CJS)
- Externalizes `obsidian`, `electron`, all `@codemirror/*`, `@lezer/*`, and Node builtins
- Auto-generates `manifest.json` from the `manifest` option
- Extracts CSS to `styles.css`

## Options

```typescript
export interface ObsidianPluginOptions {
  manifest: ObsidianManifestExport; // object, promise, or env callback
  entry?: string;                   // default: "main.ts"
  outDir?: string;                  // default: "dist"
  cssFileName?: string;             // default: "styles.css"
  sourcemap?: "inline" | "hidden" | false;
  minify?: boolean;                 // default: false
  external?: string[];              // additional externals
}
```

## License

MIT
