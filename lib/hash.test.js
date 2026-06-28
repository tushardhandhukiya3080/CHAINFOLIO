import { describe, it, expect } from "vitest";
import { sha256Hex, blockString, hashBlock, GENESIS_PREV } from "./hash.js";

describe("sha256Hex", () => {
  it("matches the known SHA-256 vector for an empty string", async () => {
    expect(await sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });

  it("matches the known SHA-256 vector for 'abc'", async () => {
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("is deterministic (same input → same hash)", async () => {
    expect(await sha256Hex("hello")).toBe(await sha256Hex("hello"));
  });

  it("avalanche: a one-character change rewrites the whole hash", async () => {
    const a = await sha256Hex("hello");
    const b = await sha256Hex("hellp");
    expect(a).not.toBe(b);
  });

  it("always returns 64 hex characters", async () => {
    const h = await sha256Hex("anything");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("blockString + hashBlock", () => {
  it("blockString serializes all fields deterministically", () => {
    expect(blockString(1, "prev", 7, "data")).toBe("1|prev|7|data");
  });

  it("changes when the nonce changes (proof-of-work)", async () => {
    const h1 = await hashBlock(0, GENESIS_PREV, 0, "tx");
    const h2 = await hashBlock(0, GENESIS_PREV, 1, "tx");
    expect(h1).not.toBe(h2);
  });

  it("changes when the previous hash changes (chain linkage)", async () => {
    const h1 = await hashBlock(1, "a".repeat(64), 0, "tx");
    const h2 = await hashBlock(1, "b".repeat(64), 0, "tx");
    expect(h1).not.toBe(h2);
  });

  it("can mine a nonce that satisfies a 1-zero difficulty", async () => {
    let n = 0;
    let h = await hashBlock(0, GENESIS_PREV, n, "mine me");
    while (!h.startsWith("0")) {
      n++;
      h = await hashBlock(0, GENESIS_PREV, n, "mine me");
    }
    expect(h.startsWith("0")).toBe(true);
  });
});
