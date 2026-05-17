import type { ObsidianManifestExport } from "./manifest";

/** Options for the Obsidian Vite plugin. */
export interface ObsidianPluginOptions {
  /**
   * Obsidian manifest object, promise, or env callback.
   */
  manifest: ObsidianManifestExport;
  /**
   * Entrypoint for the plugin. Defaults to `"main.ts"`.
   */
  entry?: string;
  /**
   * Output directory. Defaults to `"dist"`.
   */
  outDir?: string;
  /**
   * Name of the CSS output file. Defaults to `"styles.css"`.
   */
  cssFileName?: string;
  /**
   * Sourcemap mode. `"inline"` by default. Set `false` to disable.
   */
  sourcemap?: "inline" | "hidden" | false;
  /**
   * Whether to minify output. Defaults to `false`.
   * Obsidian plugins load from disk, so minification is optional.
   */
  minify?: boolean;
  /**
   * Additional modules to mark as external. Obsidian APIs and Node
   * builtins are already included.
   */
  external?: string[];
}
