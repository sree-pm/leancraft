#!/usr/bin/env node
// leancraft CLI — unified entry for npx leancraft
// Usage: npx leancraft init | validate | sync | lock | unlock | status | --help

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const cmd = args[0];

function help() {
  console.log(`
leancraft — doc-first verified agency

Usage:
  npx leancraft init [--force]     Scaffold .leancraft/ + hooks + skills in current repo
  npx leancraft validate           Check registry (docs, sections, min counts, URLs, TODO)
  npx leancraft sync               Regenerate agent/context.md + status.md + ledger
  npx leancraft lock               Lock human/** (validate must PASS first)
  npx leancraft unlock             Unlock human/** for agent drafting
  npx leancraft status             Show lock state + validate summary
  npx leancraft mcp                Print MCP config snippet

See: https://github.com/sree-pm/leancraft
`);
}

function runScript(name) {
  const p = path.join(pkgRoot, "scripts", name);
  execSync(`node "${p}" ${args.slice(1).join(" ")}`, { stdio: "inherit" });
}

async function init() {
  const force = args.includes("--force");
  const dest = process.cwd();
  const src = path.join(pkgRoot, ".leancraft");

  // Copy .leancraft if not exists
  if (fs.existsSync(path.join(dest, ".leancraft")) && !force) {
    console.log("`.leancraft/` already exists. Use --force to overwrite.");
  } else {
    console.log("Scaffolding .leancraft/...");
    execSync(`node -e "const fs=require('fs'),p=require('path');function cp(s,d){fs.mkdirSync(d,{recursive:true});for(const f of fs.readdirSync(s)){const a=p.join(s,f),b=p.join(d,f);if(fs.statSync(a).isDirectory())cp(a,b);else if(!fs.existsSync(b)||process.argv.includes('--force'))fs.copyFileSync(a,b)} } cp(process.argv[1],process.argv[2])" "${src}" "${path.join(dest, ".leancraft")}" ${force ? "--force" : ""}`, { stdio: "inherit" });
  }

  // Copy skills
  const skills = [
    [".claude/skills/leancraft/SKILL.md", ".claude/skills/leancraft/SKILL.md"],
    [".cursor/rules/leancraft.mdc", ".cursor/rules/leancraft.mdc"],
  ];
  for (const [s, d] of skills) {
    const sp = path.join(pkgRoot, s);
    const dp = path.join(dest, d);
    if (fs.existsSync(sp)) {
      fs.mkdirSync(path.dirname(dp), { recursive: true });
      if (!fs.existsSync(dp) || force) {
        fs.copyFileSync(sp, dp);
        console.log(`+ ${d}`);
      }
    }
  }
  // AGENTS.md + CLAUDE.md at root
  for (const f of ["AGENTS.md", "CLAUDE.md"]) {
    const sp = path.join(pkgRoot, f);
    const dp = path.join(dest, f);
    if (fs.existsSync(sp) && (!fs.existsSync(dp) || force)) {
      fs.copyFileSync(sp, dp);
      console.log(`+ ${f}`);
    }
  }
  // .mcp.json merge
  const mcpSrc = path.join(pkgRoot, ".mcp.json");
  const mcpDest = path.join(dest, ".mcp.json");
  if (fs.existsSync(mcpSrc) && !fs.existsSync(mcpDest)) {
    fs.copyFileSync(mcpSrc, mcpDest);
    console.log(`+ .mcp.json`);
  }
  // .github
  if (!fs.existsSync(path.join(dest, ".github/CODEOWNERS")) && fs.existsSync(path.join(pkgRoot, ".github/CODEOWNERS"))) {
    fs.mkdirSync(path.join(dest, ".github"), { recursive: true });
    fs.copyFileSync(path.join(pkgRoot, ".github/CODEOWNERS"), path.join(dest, ".github/CODEOWNERS"));
    console.log(`+ .github/CODEOWNERS`);
  }
  // hooks
  try {
    execSync(`node "${path.join(pkgRoot, "scripts/install-hooks.mjs")}"`, { stdio: "inherit" });
  } catch {}

  console.log(`
✓ leancraft init done.

Next:
  1. Fill .leancraft/human/discovery/* (from idea + research)
  2. npm run leancraft:validate   → must PASS
  3. npx leancraft lock           → human owns, agent read-only
  4. Agent now works via agent/proposals/ + auto agent/status.md

MCP: add .mcp.json to your agent (Claude Code / Cursor / Opencode already reads it).
Docs: https://github.com/sree-pm/leancraft
`);
}

if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") help();
else if (cmd === "init") await init();
else if (cmd === "validate") runScript("leancraft-validate.mjs");
else if (cmd === "sync") runScript("leancraft-sync.mjs");
else if (cmd === "lock") runScript("leancraft-lock.mjs");
else if (cmd === "unlock") execSync(`node "${path.join(pkgRoot, "scripts/leancraft-lock.mjs")}" unlock`, { stdio: "inherit" });
else if (cmd === "status") {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), ".leancraft/config.json"), "utf8"));
    console.log(`locked: ${cfg.locked}`);
  } catch { console.log("No .leancraft/config.json — run npx leancraft init"); }
  runScript("leancraft-validate.mjs");
}
else if (cmd === "mcp") {
  console.log(fs.readFileSync(path.join(pkgRoot, ".mcp.json"), "utf8"));
}
else {
  console.error(`Unknown command: ${cmd}`);
  help();
  process.exit(1);
}
