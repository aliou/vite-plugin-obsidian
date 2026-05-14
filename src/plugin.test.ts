import { describe, expect, it } from "vitest";
import { obsidian } from "./plugin";

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

describe("obsidian plugin", () => {
  it("has the correct plugin name", () => {
    const plugin = obsidian();
    expect(plugin.name).toBe("obsidian");
  });

  it("applies only to build", () => {
    const plugin = obsidian();
    expect(plugin.apply).toBe("build");
  });

  describe("config hook", () => {
    it("returns library mode with CJS output", async () => {
      const plugin = obsidian();
      const config = await callConfigHook(plugin);
      expect(config.build.lib.formats).toEqual(["cjs"]);
      expect(config.build.lib.fileName()).toBe("main.js");
    });

    it("uses default entry main.ts", async () => {
      const plugin = obsidian();
      const config = await callConfigHook(plugin);
      expect(config.build.lib.entry).toBe("main.ts");
    });

    it("uses custom entry", async () => {
      const plugin = obsidian({ entry: "src/main.ts" });
      const config = await callConfigHook(plugin);
      expect(config.build.lib.entry).toBe("src/main.ts");
    });

    it("defaults sourcemap to inline", async () => {
      const plugin = obsidian();
      const config = await callConfigHook(plugin);
      expect(config.build.sourcemap).toBe("inline");
    });

    it("respects sourcemap: false", async () => {
      const plugin = obsidian({ sourcemap: false });
      const config = await callConfigHook(plugin);
      expect(config.build.sourcemap).toBe(false);
    });

    it("defaults minify to false", async () => {
      const plugin = obsidian();
      const config = await callConfigHook(plugin);
      expect(config.build.minify).toBe(false);
    });

    it("respects minify: true", async () => {
      const plugin = obsidian({ minify: true });
      const config = await callConfigHook(plugin);
      expect(config.build.minify).toBe(true);
    });

    it("externalizes obsidian and node builtins", async () => {
      const plugin = obsidian();
      const config = await callConfigHook(plugin);
      const isExternal = config.build.rollupOptions.external;
      expect(isExternal("obsidian")).toBe(true);
      expect(isExternal("fs")).toBe(true);
      expect(isExternal("my-module")).toBe(false);
    });
  });

  describe("generateBundle hook", () => {
    it("emits manifest.json from package.json", async () => {
      const plugin = obsidian();
      const emitted: Array<{ type: string; fileName: string; source: string }> =
        [];

      const ctx = {
        emitFile: (file: { type: string; fileName: string; source: string }) =>
          emitted.push(file),
      };

      await (plugin.generateBundle as (...args: unknown[]) => unknown).call(
        ctx,
      );

      expect(emitted).toHaveLength(1);
      expect(emitted[0].fileName).toBe("manifest.json");

      const manifest = JSON.parse(emitted[0].source);
      // These assertions depend on the plugin's own package.json
      expect(manifest).toHaveProperty("id");
      expect(manifest).toHaveProperty("name");
      expect(manifest).toHaveProperty("version");
      expect(manifest).toHaveProperty("minAppVersion");
    });
  });
});
