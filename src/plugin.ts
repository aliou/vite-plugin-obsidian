import type { ConfigEnv, Plugin, UserConfig } from "vite";
import { version as viteVersion } from "vite";
import { createExternalMatcher } from "./external";
import type { ObsidianManifest, ObsidianManifestExport } from "./manifest";
import type { ObsidianPluginOptions } from "./options";

// Rolldown (vite 8+) renamed output.inlineDynamicImports to
// output.codeSplitting; both mean "emit a single chunk", which Obsidian
// requires since it only loads main.js.
const usesCodeSplittingOption =
  Number.parseInt(viteVersion.split(".")[0], 10) >= 8;

function resolveOptions(options: ObsidianPluginOptions) {
  return {
    entry: options.entry || "main.ts",
    outDir: options.outDir || "dist",
    cssFileName: options.cssFileName || "styles.css",
    minify: options.minify ?? false,
    sourcemap: options.sourcemap ?? "inline",
  };
}

async function resolveManifest(
  manifest: ObsidianManifestExport,
  env: ConfigEnv | undefined,
): Promise<ObsidianManifest> {
  if (typeof manifest !== "function") return manifest;
  if (!env) {
    throw new Error(
      "The manifest function needs the build environment from the config hook. Run the plugin through Vite so config runs before generateBundle.",
    );
  }
  return manifest(env);
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
  const { entry, outDir, cssFileName, minify, sourcemap } =
    resolveOptions(options);
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
            cssFileName,
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
              ...(usesCodeSplittingOption
                ? { codeSplitting: false }
                : { inlineDynamicImports: true }),
            },
          },
        },
      };
    },
    async generateBundle() {
      const manifest = await resolveManifest(options.manifest, configEnv);

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify(manifest, null, 2)}\n`,
      });
    },
  };
}
