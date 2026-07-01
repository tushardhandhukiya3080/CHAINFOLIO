import { describe, it, expect } from "vitest";
import { toTokenAmount, formatTokenBalance, ERC20_TOKENS, PRICE_IDS } from "./tokens.js";

describe("toTokenAmount (raw bigint + decimals → number)", () => {
  it("formats 6-decimal USDC (1.5)", () => {
    expect(toTokenAmount(1_500_000n, 6)).toBe(1.5);
  });

  it("formats 18-decimal token (1.0)", () => {
    expect(toTokenAmount(1_000_000_000_000_000_000n, 18)).toBe(1);
  });

  it("formats 8-decimal WBTC (0.5)", () => {
    expect(toTokenAmount(50_000_000n, 8)).toBe(0.5);
  });

  it("returns 0 for a zero balance", () => {
    expect(toTokenAmount(0n, 18)).toBe(0);
  });

  it("returns 0 for null/undefined", () => {
    expect(toTokenAmount(null, 18)).toBe(0);
    expect(toTokenAmount(undefined, 6)).toBe(0);
  });

  it("accepts a decimal string as input", () => {
    expect(toTokenAmount("2500000", 6)).toBe(2.5);
  });
});

describe("formatTokenBalance (human-readable string)", () => {
  it("groups thousands (1,234.56)", () => {
    expect(formatTokenBalance(1_234_560_000n, 6)).toBe("1,234.56");
  });

  it("caps fraction digits and rounds", () => {
    expect(formatTokenBalance(1_123_456_789_012_345_678n, 18, 6)).toBe("1.123457");
  });
});

describe("token registry", () => {
  it("has unique symbols, checksummed-length addresses, and a CoinGecko id each", () => {
    const symbols = new Set();
    for (const t of ERC20_TOKENS) {
      expect(t.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(typeof t.id).toBe("string");
      expect(t.id.length).toBeGreaterThan(0);
      expect(Number.isInteger(t.decimals)).toBe(true);
      expect(symbols.has(t.symbol)).toBe(false);
      symbols.add(t.symbol);
    }
  });

  it("PRICE_IDS includes ethereum plus every token id, de-duped", () => {
    expect(PRICE_IDS).toContain("ethereum");
    for (const t of ERC20_TOKENS) expect(PRICE_IDS).toContain(t.id);
    expect(PRICE_IDS.length).toBe(new Set(PRICE_IDS).size);
  });
});
