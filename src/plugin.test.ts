import { describe, expect, it } from "vitest";
import type { ObsidianManifest } from "./manifest";
import { obsidian } from "./plugin";

const testManifest: ObsidianManifest = {
  id: "test-plugin",
  name: "Test Plugin",
  version: "1.0.0",
  minAppVersion: "1.0.0",
  description: "A test plugin",
  author: "Test Author",
};

// We test the plugin by calling its hooks directly.
// The `config` hook returns a partial Vite config, and `generateBundle`
// emits a manifest.json asset.

function callConfigHook(plugin: ReturnType<typeof obsidian>) {
  return (plugin.config as (...args: unknown[]) => unknown).call(
    plugin,
  ) as Promise<{
    build: {
      lib: {
        entry: string;
        name: string;
        fileName: () => string;
        formats: string[];
      };
      outDir: string;
      sourcemap: string | false;
      minify: boolean;
      rollupOptions: { external: (id: string) => boolean };
    };
  }>;
}

async function callGenerateBundleHook(plugin: ReturnType<typeof obsidian>) {
  const emitted: Array<{ type: string; fileName: string; source: string }> = [];

  const ctx = {
    emitFile: (file: { type: string; fileName: string; source: string }) =>
      emitted.push(file),
  };

  await (plugin.generateBundle as (...args: unknown[]) => unknown).call(ctx);

  return emitted;
}

describe("obsidian plugin", () => {
  it("has the correct plugin name", () => {
    const plugin = obsidian({ manifest: testManifest });
    expect(plugin.name).toBe("obsidian");
  });

  it("applies only to build", () => {
    const plugin = obsidian({ manifest: testManifest });
    expect(plugin.apply).toBe("build");
  });

  describe("config hook", () => {
    it("returns library mode with CJS output", async () => {
      const plugin = obsidian({ manifest: testManifest });
      const config = await callConfigHook(plugin);
      expect(config.build.lib.formats).toEqual(["cjs"]);
      expect(config.build.lib.fileName()).toBe("main.js");
    });

    it("uses default entry main.ts", async () => {
      const plugin = obsidian({ manifest: testManifest });
      const config = await callConfigHook(plugin);
      expect(config.build.lib.entry).toBe("main.ts");
    });

    it("uses custom entry", async () => {
      const plugin = obsidian({ entry: "src/main.ts", manifest: testManifest });
      const config = await callConfigHook(plugin);
      expect(config.build.lib.entry).toBe("src/main.ts");
    });

    it("defaults sourcemap to inline", async () => {
      const plugin = obsidian({ manifest: testManifest });
      const config = await callConfigHook(plugin);
      expect(config.build.sourcemap).toBe("inline");
    });

    it("respects sourcemap: false", async () => {
      const plugin = obsidian({ manifest: testManifest, sourcemap: false });
      const config = await callConfigHook(plugin);
      expect(config.build.sourcemap).toBe(false);
    });

    it("defaults minify to false", async () => {
      const plugin = obsidian({ manifest: testManifest });
      const config = await callConfigHook(plugin);
      expect(config.build.minify).toBe(false);
    });

    it("respects minify: true", async () => {
      const plugin = obsidian({ manifest: testManifest, minify: true });
      const config = await callConfigHook(plugin);
      expect(config.build.minify).toBe(true);
    });

    it("externalizes obsidian and node builtins", async () => {
      const plugin = obsidian({ manifest: testManifest });
      const config = await callConfigHook(plugin);
      const isExternal = config.build.rollupOptions.external;
      expect(isExternal("obsidian")).toBe(true);
      expect(isExternal("fs")).toBe(true);
      expect(isExternal("my-module")).toBe(false);
    });
  });

  describe("generateBundle hook", () => {
    it("emits manifest.json from the manifest option", async () => {
      const plugin = obsidian({ manifest: testManifest });

      const emitted = await callGenerateBundleHook(plugin);

      expect(emitted).toHaveLength(1);
      expect(emitted[0].fileName).toBe("manifest.json");
      expect(JSON.parse(emitted[0].source)).toEqual(testManifest);
    });

    it("supports async manifest options", async () => {
      const plugin = obsidian({ manifest: Promise.resolve(testManifest) });

      const emitted = await callGenerateBundleHook(plugin);

      expect(JSON.parse(emitted[0].source)).toEqual(testManifest);
    });

    it("supports manifest option callbacks", async () => {
      const plugin = obsidian({
        manifest: (env) => ({
          ...testManifest,
          id: `test-plugin-${env.mode}`,
        }),
      });

      await callConfigHook(plugin);
      const emitted = await callGenerateBundleHook(plugin);

      expect(JSON.parse(emitted[0].source).id).toBe("test-plugin-production");
    });
  });
});
