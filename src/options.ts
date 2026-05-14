/** Options for the Obsidian Vite plugin. */
export interface ObsidianPluginOptions {
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
  /**
   * Path to `manifest.config.ts` (or `.js`). When set, the plugin reads
   * the manifest from this file instead of requiring inline options.
   * If omitted, the plugin falls back to reading from `package.json`.
   */
  manifestConfigPath?: string;
}
