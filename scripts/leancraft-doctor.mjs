#!/usr/bin/env node
// leancraft doctor — checks git/node/validate/allowlist health for non-tech

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("─ Leancraft Doctor ─\n");

function check(name, fn) {
  try {
    const ok = fn();
    console.log(`${ok ? "✓" : "✖"} ${name}: ${ok ? "ok" : "FAIL"}`);
    return ok;
  } catch (e) {
    console.log(`✖ ${name}: ${e.message}`);
    return false;
  }
}

check("node >=18", () => {
  const v = parseInt(process.versions.node.split(".")[0], 10);
  return v >= 18;
});

check("git repo", () => fs.existsSync(path.join(process.cwd(), ".git")));

check(".leancraft/config.json exists", () => fs.existsSync(path.join(process.cwd(), ".leancraft/config.json")));

check("config.json locked status", () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), ".leancraft/config.json"), "utf8"));
  console.log(`  locked: ${cfg.locked}, allowlist: ${cfg.budget.allowlist.join(", ")}`);
  return true;
});

check("validate script exists", () => fs.existsSync(path.join(process.cwd(), "scripts/leancraft-validate.mjs")));

check("pre-commit hook installed", () => fs.existsSync(path.join(process.cwd(), ".git/hooks/pre-commit")));

try {
  console.log("\n─ Validate (quick) ─");
  execSync("node scripts/leancraft-validate.mjs", { stdio: "inherit" });
} catch {}

console.log("\nTip: Run npx leancraft budget for lifetime cost.");
