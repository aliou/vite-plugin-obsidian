import type { ConfigEnv } from "vite";

/**
 * Represents an Obsidian plugin manifest.
 *
 * @see https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
 */
export interface ObsidianManifest {
  /** Plugin ID. Must be unique and never change after first release. */
  id: string;
  /** Human-readable plugin name. */
  name: string;
  /** Plugin version (SemVer). */
  version: string;
  /** Minimum supported Obsidian app version. */
  minAppVersion: string;
  /** Short description. */
  description: string;
  /** Author name. */
  author: string;
  /** Author website. */
  authorUrl?: string;
  /** Funding URL. */
  fundingUrl?: string;
  /** Whether the plugin is desktop-only. Defaults to false. */
  isDesktopOnly?: boolean;
}

export type ObsidianManifestFn = (
  env: ConfigEnv,
) => ObsidianManifest | Promise<ObsidianManifest>;
export type ObsidianManifestExport =
  | ObsidianManifest
  | Promise<ObsidianManifest>
  | ObsidianManifestFn;

/**
 * Define an Obsidian plugin manifest in a `manifest.config.ts` file.
 *
 * This mirrors `@crxjs/vite-plugin`: pass the exported value to the
 * `manifest` plugin option.
 *
 * @example
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
export function defineManifest(
  manifest: ObsidianManifestExport,
): ObsidianManifestExport {
  return manifest;
}

export type { ObsidianManifest as ObsidianManifestInput };
