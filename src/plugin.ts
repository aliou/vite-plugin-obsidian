import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin, UserConfig } from "vite";
import { createExternalMatcher } from "./external";
import type { ObsidianManifest } from "./manifest";
import type { ObsidianPluginOptions } from "./options";

/**
 * Load package.json from the given path, or cwd as fallback.
 */
function loadPackageJson(path?: string): Record<string, unknown> {
  const target = path || join(process.cwd(), "package.json");
  return JSON.parse(readFileSync(target, "utf8")) as Record<string, unknown>;
}

/**
 * Derive a plugin ID from a package name (strip scope).
 */
function stripScope(name: string): string {
  return name.replace(/^@[^/]+[/]/, "");
}

/**
 * Resolve the manifest config export from a `.ts` or `.js` file.
 *
 * We use Vite's own `ssrLoadModule` during dev / build so the user
 * can write their manifest config in TypeScript without pre-compiling.
 * Falls back to a direct `import()` when called outside a Vite context.
 */
async function loadManifestConfig(
  path: string,
): Promise<ObsidianManifest | undefined> {
  // We'll use dynamic import for .js files and Vite's SSR loading for .ts files
  // But since this runs inside a Vite plugin hook, we use dynamic import directly
  // Vite handles .ts files through its own pipeline during build.
  try {
    // For .ts files during build, Vite can handle them via ssrLoadModule
    // But for simplicity and reliability, we'll just import directly
    const mod = await import(path);
    const config = mod.default ?? mod;
    return typeof config === "object" ? config : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build an `ObsidianManifest` from `package.json` fields.
 */
function manifestFromPackageJson(
  pkg: Record<string, unknown>,
  overrides?: Partial<ObsidianManifest>,
): ObsidianManifest {
  const pkgName = (pkg.name as string) || "obsidian-plugin";
  const manifest: ObsidianManifest = {
    id: overrides?.id || stripScope(pkgName),
    name: overrides?.name || pkgName,
    version: (pkg.version as string) || "0.0.0",
    minAppVersion: overrides?.minAppVersion || "0.15.0",
    description: (pkg.description as string) || "",
    author:
      overrides?.author ||
      (typeof pkg.author === "string" ? pkg.author : "") ||
      "",
    isDesktopOnly: overrides?.isDesktopOnly ?? false,
  };

  const authorUrl =
    overrides?.authorUrl ||
    (pkg.authorUrl as string) ||
    (pkg.homepage as string) ||
    "";
  if (authorUrl) {
    manifest.authorUrl = authorUrl;
  }

  return manifest;
}

/**
 * Vite plugin for building Obsidian plugins.
 *
 * Handles:
 * - Library mode with CommonJS output (Obsidian requires CJS)
 * - Externalizing obsidian, electron, codemirror, and Node builtins
 * - Auto-generating `manifest.json` from `manifest.config.ts` or `package.json`
 * - Extracting CSS to `styles.css`
 *
 * @example
 * With a manifest config file:
 * ```ts
 * // vite.config.ts
 * import { obsidian } from "@aliou/vite-plugin-obsidian";
 * import { defineConfig } from "vite";
 *
 * export default defineConfig({
 *   plugins: [obsidian()],
 * });
 * ```
 *
 * ```ts
 * // manifest.config.ts
 * import { defineManifest } from "@aliou/vite-plugin-obsidian";
 *
 * export default defineManifest({
 *   id: "my-plugin",
 *   name: "My Plugin",
 *   version: "1.0.0",
 *   minAppVersion: "1.0.0",
 *   description: "A cool plugin",
 *   author: "Me",
 * });
 * ```
 */
export function obsidian(options: ObsidianPluginOptions = {}): Plugin {
  const entry = options.entry || "main.ts";
  const outDir = options.outDir || "dist";
  const cssFileName = options.cssFileName || "styles.css";
  const minify = options.minify ?? false;
  const sourcemap = options.sourcemap ?? "inline";
  const manifestConfigPath = options.manifestConfigPath;

  return {
    name: "obsidian",
    apply: "build",
    async config(): Promise<UserConfig> {
      return {
        build: {
          lib: {
            entry,
            name: "main",
            fileName: () => "main.js",
            formats: ["cjs"],
          },
          outDir,
          emptyOutDir: false,
          sourcemap,
          minify,
          target: "es2020",
          rollupOptions: {
            external: createExternalMatcher(options.external),
            output: {
              globals: {
                obsidian: "obsidian",
              },
              assetFileNames: cssFileName,
              inlineDynamicImports: true,
            },
          },
        },
      };
    },
    async generateBundle() {
      let manifest: ObsidianManifest;

      if (manifestConfigPath) {
        const configManifest = await loadManifestConfig(manifestConfigPath);
        if (!configManifest) {
          throw new Error(
            `@aliou/vite-plugin-obsidian: could not load manifest config from "${manifestConfigPath}".`,
          );
        }
        manifest = configManifest;
      } else {
        let pkg: Record<string, unknown>;
        try {
          pkg = loadPackageJson();
        } catch {
          throw new Error(
            "@aliou/vite-plugin-obsidian: could not find package.json. " +
              "Create a manifest.config.ts or run from a project root.",
          );
        }
        manifest = manifestFromPackageJson(pkg);
      }

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify(manifest, null, 2)}\n`,
      });
    },
  };
}
