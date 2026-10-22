# Agents

Vite plugin for building Obsidian plugins, published to npm as `@aliou/vite-plugin-obsidian`. People build their plugins with it, so treat the public API (`obsidian()` options, `defineManifest`, manifest types) as backwards-compatibility-sensitive.

## Releases

Every user-facing change needs a changeset (`pnpm changeset`). `.github/workflows/publish.yml` turns pending changesets into a release PR and, once it is merged, stages the release on npm. A staged release is not public until it is promoted on npmjs.com.

## Docs

`README.md` documents the public API. Update it whenever `ObsidianPluginOptions`, manifest handling, or the plugin's build behavior changes.
