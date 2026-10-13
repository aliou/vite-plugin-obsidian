import builtins from "builtin-modules";

/**
 * Obsidian runtime modules that must be externalized.
 */
const OBSIDIAN_MODULES = ["obsidian", "electron"];

/**
 * Module prefixes that must be externalized. Obsidian embeds its own
 * CodeMirror and Lezer installations.
 */
const EXTERNAL_PREFIXES = ["@codemirror/", "@lezer/"];

/**
 * Create a function that checks whether a module ID should be externalized.
 *
 * Obsidian plugins run inside the Obsidian app, so `obsidian`, `electron`,
 * CodeMirror, Lezer, and Node builtins must not be bundled.
 */
export function createExternalMatcher(
  extraExternal: string[] = [],
): (id: string) => boolean {
  const external = new Set([
    ...OBSIDIAN_MODULES,
    ...builtins,
    ...extraExternal,
  ]);

  return (id: string) => {
    if (external.has(id)) return true;
    if (id.startsWith("node:")) return true;
    return EXTERNAL_PREFIXES.some((prefix) => id.startsWith(prefix));
  };
}
