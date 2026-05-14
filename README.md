# @aliou/vite-plugin-obsidian

Vite plugin for building Obsidian plugins.

## Install

```bash
npm install -D @aliou/vite-plugin-obsidian
```

## Usage

### With a manifest config file (recommended)

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

Then use the plugin in your Vite config:

```typescript
// vite.config.ts
import { obsidian } from "@aliou/vite-plugin-obsidian";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [obsidian()],
});
```

Point to the manifest config if it's not at the default location:

```typescript
// vite.config.ts
import { obsidian } from "@aliou/vite-plugin-obsidian";

export default defineConfig({
  plugins: [
    obsidian({
      manifestConfigPath: "./obsidian.config.ts",
    }),
  ],
});
```

### Without a manifest config

If no `manifestConfigPath` is set, the plugin reads from `package.json` and derives the manifest:

| Manifest field | Source |
|---|---|
| `id` | `name` (with scope stripped) |
| `name` | `name` |
| `version` | `version` |
| `description` | `description` |
| `author` | `author` |
| `authorUrl` | `homepage` or `authorUrl` |

## What it does

- Sets Vite to library mode with CommonJS output (Obsidian loads plugins as CJS)
- Externalizes `obsidian`, `electron`, all `@codemirror/*`, `@lezer/*`, and Node builtins
- Auto-generates `manifest.json` from your manifest config or `package.json`
- Extracts CSS to `styles.css`

## Options

```typescript
export interface ObsidianPluginOptions {
  entry?: string;              // default: "main.ts"
  outDir?: string;             // default: "dist"
  cssFileName?: string;        // default: "styles.css"
  sourcemap?: "inline" | "hidden" | false;
  minify?: boolean;            // default: false
  external?: string[];         // additional externals
  manifestConfigPath?: string; // path to manifest.config.ts
}
```

## License

MIT
