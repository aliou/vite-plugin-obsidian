import type { ConfigEnv, Plugin, UserConfig } from "vite";
import { createExternalMatcher } from "./external";
import type { ObsidianManifest, ObsidianManifestExport } from "./manifest";
import type { ObsidianPluginOptions } from "./options";

async function resolveManifest(
  manifest: ObsidianManifestExport,
  env: ConfigEnv,
): Promise<ObsidianManifest> {
  return typeof manifest === "function" ? manifest(env) : manifest;
}

/**
 * Vite plugin for building Obsidian plugins.
 *
 * Handles:
 * - Library mode with CommonJS output (Obsidian requires CJS)
 * - Externalizing obsidian, electron, codemirror, and Node builtins
 * - Auto-generating `manifest.json` from the `manifest` option
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
 *   plugins: [obsidian({ manifest })],
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
export function obsidian(options: ObsidianPluginOptions): Plugin {
  const entry = options.entry || "main.ts";
  const outDir = options.outDir || "dist";
  const cssFileName = options.cssFileName || "styles.css";
  const minify = options.minify ?? false;
  const sourcemap = options.sourcemap ?? "inline";
  let configEnv: ConfigEnv | undefined;

  return {
    name: "obsidian",
    apply: "build",
    async config(_config, env): Promise<UserConfig> {
      configEnv = env;
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
      const manifest = await resolveManifest(
        options.manifest,
        configEnv ?? {
          command: "build",
          mode: "production",
          isSsrBuild: false,
          isPreview: false,
        },
      );

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify(manifest, null, 2)}\n`,
      });
    },
  };
}
