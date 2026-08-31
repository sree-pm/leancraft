#!/usr/bin/env node
// leancraft budget — shows per-run vs lifetime cost from ledger
// Usage: node scripts/leancraft-budget.mjs [--summary]

import fs from "fs";
import path from "path";

const ledgerPath = path.join(process.cwd(), ".leancraft/joint/ledger.jsonl");
const configPath = path.join(process.cwd(), ".leancraft/config.json");

let cfg = { budget: { maxCostUSD: 5, maxToolCalls: 25 } };
try { cfg = JSON.parse(fs.readFileSync(configPath, "utf8")); } catch {}

let totalCost = 0, totalCalls = 0, runs = 0;
try {
  const lines = fs.readFileSync(ledgerPath, "utf8").split("\n").filter(Boolean);
  for (const line of lines) {
    const e = JSON.parse(line);
    totalCost += e.cost || 0;
    totalCalls += e.calls || 0;
    runs++;
  }
} catch {}

console.log(`─ Leancraft Budget ─`);
console.log(`Per-run recommended: $${cfg.budget.maxCostUSD} / ${cfg.budget.maxToolCalls} calls / ${cfg.budget.maxWallClockMinutes} min`);
console.log(`Lifetime: $${totalCost.toFixed(2)} / ${totalCalls} calls / ${runs} runs (from ledger.jsonl)`);
console.log(`\nNote: Recommended, not enforced — agent should self-limit; ledger tracks truth.`);
