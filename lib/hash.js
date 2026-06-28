// Shared block-hashing helpers used by the Block Simulator and its unit tests.
// Uses the Web Crypto API (available in the browser and in Node 20+).

export const GENESIS_PREV = "0".repeat(64);

// Deterministic string representation of a block. The hash depends on ALL of
// these fields — including the previous block's hash — which is what links the
// chain together.
export function blockString(index, prevHash, nonce, data) {
  return `${index}|${prevHash}|${nonce}|${data}`;
}

// SHA-256 → lowercase hex string.
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Convenience: hash a whole block.
export function hashBlock(index, prevHash, nonce, data) {
  return sha256Hex(blockString(index, prevHash, nonce, data));
}
