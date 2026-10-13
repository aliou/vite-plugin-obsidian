import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "vite";
import { afterAll, assert, expect, it } from "vitest";
import type { ObsidianManifest } from "./manifest";
import { obsidian } from "./plugin";

const manifest: ObsidianManifest = {
  id: "integration-plugin",
  name: "Integration Plugin",
  version: "1.0.0",
  minAppVersion: "1.0.0",
  description: "Built by a real Vite build",
  author: "Test Author",
};

const fixtureDir = mkdtempSync(join(tmpdir(), "vite-plugin-obsidian-"));

afterAll(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

it("builds an Obsidian plugin end to end", async () => {
  writeFileSync(
    join(fixtureDir, "main.ts"),
    [
      'import "./style.css";',
      'import { Plugin } from "obsidian";',
      "",
      "export default class extends Plugin {}",
      "",
    ].join("\n"),
  );
  writeFileSync(join(fixtureDir, "style.css"), "body { color: red; }\n");
  writeFileSync(
    join(fixtureDir, "package.json"),
    JSON.stringify({ type: "module" }),
  );

  await build({
    root: fixtureDir,
    logLevel: "silent",
    plugins: [obsidian({ manifest })],
  });

  const distFiles = readdirSync(join(fixtureDir, "dist"));
  assert(distFiles.includes("main.js"), "should emit main.js");
  assert(distFiles.includes("manifest.json"), "should emit manifest.json");
  assert(distFiles.includes("styles.css"), "should emit styles.css");

  const mainJs = readFileSync(join(fixtureDir, "dist", "main.js"), "utf8");
  expect(mainJs).toContain('require("obsidian")');

  const emittedManifest = JSON.parse(
    readFileSync(join(fixtureDir, "dist", "manifest.json"), "utf8"),
  );
  expect(emittedManifest).toEqual(manifest);

  const styles = readFileSync(join(fixtureDir, "dist", "styles.css"), "utf8");
  expect(styles).toContain("color: red");
}, 30_000);
