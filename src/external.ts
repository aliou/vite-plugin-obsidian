import builtins from "builtin-modules";

/**
 * Obsidian-relevant module prefixes that must be externalized.
 */
const OBSIDIAN_MODULES = [
  "obsidian",
  "electron",
  "@codemirror/autocomplete",
  "@codemirror/collab",
  "@codemirror/commands",
  "@codemirror/language",
  "@codemirror/lint",
  "@codemirror/search",
  "@codemirror/state",
  "@codemirror/view",
  "@lezer/common",
  "@lezer/highlight",
  "@lezer/lr",
];

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
    ...builtins.map((m) => `node:${m}`),
    ...extraExternal,
  ]);

  return (id: string) => {
    if (external.has(id)) return true;
    if (id.startsWith("node:")) return true;
    if (id.startsWith("@codemirror/")) return true;
    if (id.startsWith("@lezer/")) return true;
    return false;
  };
}
