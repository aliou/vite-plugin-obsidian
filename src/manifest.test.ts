import { describe, expect, it } from "vitest";
import type { ObsidianManifest } from "./manifest";
import { defineManifest } from "./manifest";

describe("defineManifest", () => {
  it("returns the manifest as-is", () => {
    const input: ObsidianManifest = {
      id: "my-plugin",
      name: "My Plugin",
      version: "1.0.0",
      minAppVersion: "1.0.0",
      description: "A test plugin",
      author: "Test Author",
    };

    const result = defineManifest(input);
    expect(result).toEqual(input);
  });

  it("preserves optional fields", () => {
    const input: ObsidianManifest = {
      id: "my-plugin",
      name: "My Plugin",
      version: "1.0.0",
      minAppVersion: "1.0.0",
      description: "A test plugin",
      author: "Test Author",
      authorUrl: "https://example.com",
      fundingUrl: "https://buymeacoffee.com/test",
      isDesktopOnly: true,
    };

    const result = defineManifest(input);
    expect(result).toEqual(input);
    expect(result.authorUrl).toBe("https://example.com");
    expect(result.fundingUrl).toBe("https://buymeacoffee.com/test");
    expect(result.isDesktopOnly).toBe(true);
  });

  it("provides type safety for the manifest shape", () => {
    // This test is really a compile-time check.
    // If ObsidianManifest is typed correctly, this compiles.
    const manifest = defineManifest({
      id: "typed-plugin",
      name: "Typed Plugin",
      version: "2.0.0",
      minAppVersion: "0.15.0",
      description: "Type-safe manifest",
      author: "Type Lover",
    });

    expect(manifest.id).toBe("typed-plugin");
    expect(manifest.isDesktopOnly).toBeUndefined();
  });
});
