import { describe, expect, it } from "vitest";
import type { ObsidianManifest } from "./manifest";
import { defineManifest } from "./manifest";

const input: ObsidianManifest = {
  id: "my-plugin",
  name: "My Plugin",
  version: "1.0.0",
  minAppVersion: "1.0.0",
  description: "A test plugin",
  author: "Test Author",
};

describe("defineManifest", () => {
  it("returns object manifests as-is", () => {
    const result = defineManifest(input);
    expect(result).toEqual(input);
  });

  it("returns promise manifests as-is", () => {
    const promise = Promise.resolve(input);
    const result = defineManifest(promise);
    expect(result).toBe(promise);
  });

  it("returns manifest callbacks as-is", () => {
    const callback = () => input;
    const result = defineManifest(callback);
    expect(result).toBe(callback);
  });

  it("provides type safety for the manifest shape", () => {
    // This test is really a compile-time check.
    // If ObsidianManifest is typed correctly, this compiles.
    const manifest: ObsidianManifest = {
      id: "typed-plugin",
      name: "Typed Plugin",
      version: "2.0.0",
      minAppVersion: "0.15.0",
      description: "Type-safe manifest",
      author: "Type Lover",
    };

    expect(defineManifest(manifest)).toEqual(manifest);
  });
});
