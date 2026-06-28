/* ============================================================
   Shared JavaScript for the Web3 Learning Site
   - Mobile nav toggle
   - Auto-highlight the active nav link
   - SHA-256 hashing demo (Web Crypto API)
   - A tiny interactive "mini blockchain" to show tamper-detection
   ============================================================ */

/* ---------- 1. Mobile navigation toggle ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }

  // Highlight the link matching the current page filename.
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const target = a.getAttribute("href");
    if (target === here) a.classList.add("active");
  });
}

/* ---------- 2. SHA-256 helper using the browser's Web Crypto API ----------
   This is the SAME family of hash function (SHA-256) that Bitcoin uses.
   A hash takes any input and returns a fixed-length fingerprint.
   Change ONE character of the input → the whole output changes.        */
async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------- 3. Live hashing demo (used on blockchain.html) ---------- */
function initHashDemo() {
  const input = document.getElementById("hash-input");
  const output = document.getElementById("hash-output");
  if (!input || !output) return;

  const render = async () => {
    output.textContent = await sha256(input.value);
  };
  input.addEventListener("input", render);
  render(); // initial value
}

/* ---------- 4. Mini blockchain demo (used on blockchain.html) ----------
   Each block's hash depends on its data + the PREVIOUS block's hash.
   Edit any block's data and you'll see that block — and every block
   after it — turn red, because the chain of hashes no longer matches.
   That is exactly why a blockchain is "tamper-evident".               */
async function computeBlockHash(index, data, prevHash) {
  return sha256(index + data + prevHash);
}

async function renderChain() {
  const wrap = document.getElementById("chain");
  if (!wrap) return;

  const blocks = [...wrap.querySelectorAll(".block")];
  let prevHash = "0".repeat(64); // genesis block points to all-zero hash

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const data = block.querySelector(".block-data").value;
    const storedPrev = block.querySelector(".prev-hash");
    const hashLine = block.querySelector(".hash-value");

    // recompute what this block's hash SHOULD be
    const hash = await computeBlockHash(i, data, prevHash);

    storedPrev.textContent = prevHash.slice(0, 20) + "…";
    hashLine.textContent = hash.slice(0, 20) + "…";

    // a block is "valid" only if the previous block was valid too
    const linkOk = block.dataset.expectedPrev === undefined
      ? true
      : block.dataset.expectedPrev === prevHash;

    if (linkOk) {
      block.classList.add("valid");
      block.classList.remove("invalid");
      hashLine.classList.add("good");
      hashLine.classList.remove("bad");
    } else {
      block.classList.add("invalid");
      block.classList.remove("valid");
      hashLine.classList.add("bad");
      hashLine.classList.remove("good");
    }

    // remember the link the NEXT block expects to see
    if (blocks[i + 1]) blocks[i + 1].dataset.expectedPrev = hash;
    prevHash = hash;
  }
}

function initChainDemo() {
  const wrap = document.getElementById("chain");
  if (!wrap) return;
  wrap.querySelectorAll(".block-data").forEach((el) =>
    el.addEventListener("input", renderChain)
  );
  renderChain();
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHashDemo();
  initChainDemo();
});
