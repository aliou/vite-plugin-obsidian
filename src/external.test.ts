import { describe, expect, it } from "vitest";
import { createExternalMatcher } from "./external";

describe("createExternalMatcher", () => {
  it("matches obsidian core module", () => {
    const isExternal = createExternalMatcher();
    expect(isExternal("obsidian")).toBe(true);
  });

  it("matches electron", () => {
    const isExternal = createExternalMatcher();
    expect(isExternal("electron")).toBe(true);
  });

  it("matches @codemirror/* packages", () => {
    const isExternal = createExternalMatcher();
    expect(isExternal("@codemirror/state")).toBe(true);
    expect(isExternal("@codemirror/view")).toBe(true);
    expect(isExternal("@codemirror/autocomplete")).toBe(true);
  });

  it("matches @lezer/* packages", () => {
    const isExternal = createExternalMatcher();
    expect(isExternal("@lezer/common")).toBe(true);
    expect(isExternal("@lezer/highlight")).toBe(true);
    expect(isExternal("@lezer/lr")).toBe(true);
  });

  it("matches Node builtins", () => {
    const isExternal = createExternalMatcher();
    expect(isExternal("fs")).toBe(true);
    expect(isExternal("path")).toBe(true);
    expect(isExternal("os")).toBe(true);
  });

  it("matches node: prefix", () => {
    const isExternal = createExternalMatcher();
    expect(isExternal("node:fs")).toBe(true);
    expect(isExternal("node:path")).toBe(true);
    expect(isExternal("node:unknown")).toBe(true);
  });

  it("matches extra external modules", () => {
    const isExternal = createExternalMatcher(["my-module", "@my/scope"]);
    expect(isExternal("my-module")).toBe(true);
    expect(isExternal("@my/scope")).toBe(true);
  });

  it("does not match user modules", () => {
    const isExternal = createExternalMatcher();
    expect(isExternal("my-plugin")).toBe(false);
    expect(isExternal("./local-file")).toBe(false);
    expect(isExternal("@user/some-package")).toBe(false);
  });
});
