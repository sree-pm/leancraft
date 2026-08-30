#!/usr/bin/env node
// leancraft lock/unlock — flips config.json locked + enforces via hook
import fs from "fs";
import path from "path";

const action = process.argv[2]; // lock | unlock
if (!["lock", "unlock"].includes(action)) {
  console.error("Usage: node scripts/leancraft-lock.mjs [lock|unlock]");
  process.exit(1);
}
const configPath = path.join(process.cwd(), ".leancraft/config.json");
const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

if (action === "lock") {
  // validate first
  const { execSync } = await import("child_process");
  try {
    execSync("node scripts/leancraft-validate.mjs", { stdio: "inherit" });
  } catch {
    console.error("\n✖ Cannot lock: validate FAILED. Fix errors first.");
    process.exit(1);
  }
  cfg.locked = true;
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n");
  console.log("🔒 Locked. human/** is now READ-ONLY for agent. Agent must use agent/proposals/.");
} else {
  cfg.locked = false;
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n");
  console.log("🔓 Unlocked. Agent may draft human/**. Remember to re-lock after review.");
}
