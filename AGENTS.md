# Agents

Vite plugin for building Obsidian plugins. Published to npm as `@aliou/vite-plugin-obsidian`; people build their plugins with it, so treat the public API (`obsidian()` options, `defineManifest`, manifest types) as backwards-compatibility-sensitive.

## Dev env

- Nix: `nix develop` (direnv wired via `.envrc`)
- Node: 24+ (`engines.node >= 24`)
- Package manager: pnpm 11 (see `package.json#packageManager`)

## Common commands

- Install: `pnpm install`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Typecheck: `pnpm typecheck`
- Tests: `pnpm test` (watch: `pnpm test:watch`)
- Build: `pnpm build` (typecheck + unbuild; emits `dist/index.mjs`, `dist/index.cjs`, `dist/index.d.ts`)

## Structure

```
src/
  plugin.ts     # The Vite plugin: library-mode CJS config, manifest.json emission
  external.ts   # External matcher (obsidian, electron, @codemirror/*, @lezer/*, node builtins)
  manifest.ts   # ObsidianManifest types + defineManifest
  options.ts    # ObsidianPluginOptions type
  index.ts      # Public exports
```

Tests are colocated as `src/*.test.ts`: unit tests call the plugin's hooks directly, and `plugin.build.test.ts` runs a real Vite build against a fixture project.

## Git hooks (lefthook)

- pre-commit: biome format on staged files + typecheck
- pre-push: tests

## CI/CD

- **CI**: push to `main` and pull requests. Runs lint, typecheck, test, build on Node 24.
- **Publish**: on CI success on `main` (`.github/workflows/publish.yml`). With pending changesets it opens a release PR titled "Updating `<pkg>` to version `<x>`"; squash-merging it names the publish run in the Actions tab. Merging stages the release on npm (`npm stage publish`), then tags and creates a GitHub release from `CHANGELOG.md`.

## Publishing

This package is published to the public npm registry under `@aliou/vite-plugin-obsidian`. Uses OIDC for authentication — no token secrets needed after initial manual publish.

Release workflow (using [changesets](https://github.com/changesets/changesets)):

1. Make code changes and add a changeset: `pnpm changeset`
2. Commit the changeset file with your code and push/merge to `main`
3. The publish workflow opens a release PR titled "Updating `<pkg>` to version `<x>`" that bumps the version and updates `CHANGELOG.md`
4. Merge that PR; the workflow stages the release on npm (`npm stage publish`). Promote the staged release on npmjs.com to complete publication.

## Docs

`README.md` documents the public API (install, usage, options, behavior). Update it whenever `ObsidianPluginOptions`, the manifest handling, or the plugin's build behavior changes.
