#!/usr/bin/env node
// guard-write — write-time enforcement for human/** when locked
// Usage: node scripts/guard-write.mjs <target-path>
// Exit 0 = allowed, 1 = blocked (agent must use proposals/)

import fs from "fs";
import path from "path";

const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/guard-write.mjs <target-path>");
  process.exit(1);
}

const configPath = path.join(process.cwd(), ".leancraft/config.json");
let cfg = { locked: false };
try { cfg = JSON.parse(fs.readFileSync(configPath, "utf8")); } catch {}

const normalized = target.replace(/\\/g, "/").replace(/^\.leancraft\//, "");

if (cfg.locked && normalized.startsWith("human/")) {
  const proposal = `agent/proposals/${Date.now().toString().slice(-6)}-${normalized.replace(/\//g, "-")}.md`;
  console.error(`✖ BLOCKED: ${target} is in locked human/**.`);
  console.error(`  Agent must write to ${proposal} instead.`);
  console.error(`  Ask human: [🔓 Unlock / ❌ Don't]`);
  console.error(`  Hook is backup; this guard is primary.`);
  process.exit(1);
}

console.log(`✓ Write allowed: ${target}`);
process.exit(0);
