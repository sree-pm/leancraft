#!/usr/bin/env node
// leancraft validate — checks docRegistry tightness, no placeholders, min counts, URLs, sections
// Run: node scripts/leancraft-validate.mjs  (or npm run leancraft:validate)
// Exit 0 = PASS (Lock allowed), 1 = FAIL (Lock blocked)

import fs from "fs";
import path from "path";

const root = path.resolve(process.cwd());
const lcRoot = path.join(root, ".leancraft");
const configPath = path.join(lcRoot, "config.json");

function read(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}
function exists(p) { return fs.existsSync(p); }

const config = JSON.parse(read(configPath));
if (!config) { console.error("Missing .leancraft/config.json"); process.exit(1); }

let errors = [];
let warnings = [];
let checked = 0;

function assert(cond, msg, isWarning = false) {
  checked++;
  if (!cond) (isWarning ? warnings : errors).push(msg);
}

function checkNoPlaceholders(file, content) {
  const bad = /TODO|TBD|\[TODO|\[TBD/i;
  if (bad.test(content)) errors.push(`${file}: contains TODO/TBD placeholder`);
  // check for empty template brackets still present
  if (/\[TODO:/.test(content)) errors.push(`${file}: unfilled template [TODO:`);
}

function checkSections(file, content, requiredSections) {
  if (!requiredSections) return;
  for (const sec of requiredSections) {
    const needle = sec.toLowerCase();
    const has = content.toLowerCase().includes(needle);
    if (!has) errors.push(`${file}: missing required section "${sec}"`);
  }
}

function countMatches(content, regex) {
  return (content.match(regex) || []).length;
}

// Validate discovery + definition
for (const [group, docs] of Object.entries(config.docRegistry)) {
  if (group === "conditional") continue;
  for (const [doc, spec] of Object.entries(docs)) {
    if (doc.includes("*")) {
      // features/*.md — check at least one exists, but not required
      const dir = path.join(lcRoot, "human", "definition", "features");
      if (exists(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"));
        // Don't fail if no features yet — it's ephemeral
        if (files.length === 0) warnings.push(`human/definition/features/*.md: no features yet (ok, ephemeral)`);
        for (const f of files) {
          const content = read(path.join(dir, f));
          checkNoPlaceholders(`human/definition/features/${f}`, content);
          checkSections(`human/definition/features/${f}`, content, spec.sections);
        }
      }
      continue;
    }
    // handle sprint map etc — group is sprint, files are in human/sprint
    let filePath;
    if (group === "sprint") filePath = path.join(lcRoot, "human", "sprint", doc);
    else if (group === "discovery") filePath = path.join(lcRoot, "human", "discovery", doc);
    else if (group === "definition") filePath = path.join(lcRoot, "human", "definition", doc);
    else filePath = path.join(lcRoot, doc);

    const content = read(filePath);
    if (!content) {
      if (spec.required) errors.push(`${group}/${doc}: MISSING (required)`);
      else warnings.push(`${group}/${doc}: missing (optional)`);
      continue;
    }
    checkNoPlaceholders(`${group}/${doc}`, content);
    checkSections(`${group}/${doc}`, content, spec.sections);

    // Specific rules
    if (spec.rules) {
      if (spec.rules.minPainThemes) {
        const count = countMatches(content, /^###\s+P\d+/gm);
        assert(count >= spec.rules.minPainThemes, `${group}/${doc}: needs ${spec.rules.minPainThemes} pain themes (P1-P12), found ${count}`);
      }
      if (spec.rules.minSources) {
        const urlCount = countMatches(content, /https?:\/\//g);
        assert(urlCount >= spec.rules.minSources, `${group}/${doc}: needs ≥${spec.rules.minSources} URLs, found ${urlCount}`);
      }
      if (spec.rules.minCompetitors) {
        const hasTable = content.includes("|") && content.toLowerCase().includes("competitor");
        assert(hasTable, `${group}/${doc}: missing competitor table`);
        const rows = content.split("\n").filter(l => l.trim().startsWith("|") && !l.toLowerCase().includes("competitor") && !l.includes("---")).length;
        assert(rows >= spec.rules.minCompetitors, `${group}/${doc}: needs ≥${spec.rules.minCompetitors} competitors, found ~${rows}`);
      }
      if (spec.rules.minWedges) {
        const wedgeCount = countMatches(content, /^\d+\./gm);
        assert(wedgeCount >= spec.rules.minWedges, `${group}/${doc}: needs ≥${spec.rules.minWedges} wedges, found ${wedgeCount}`, true);
      }
      if (spec.rules.minPersonas) {
        const personaCount = countMatches(content, /^##\s+Persona/mg) || countMatches(content, /Persona \d/mg);
        assert(personaCount >= spec.rules.minPersonas, `${group}/${doc}: needs ≥${spec.rules.minPersonas} personas, found ${personaCount}`);
      }
      if (spec.rules.minUserFlows) {
        const flowCount = countMatches(content, /^###\s+Flow/mg);
        assert(flowCount >= spec.rules.minUserFlows, `${group}/${doc}: needs ≥${spec.rules.minUserFlows} user flows, found ${flowCount}`);
      }
      if (spec.rules.minFunctionalReqs) {
        const frCount = countMatches(content, /FR-\d+/g);
        assert(frCount >= spec.rules.minFunctionalReqs, `${group}/${doc}: needs ≥${spec.rules.minFunctionalReqs} FRs (FR-01...), found ${frCount}`);
      }
      if (spec.rules.minInvariants) {
        const invCount = countMatches(content, /\*\*I\d+:/g);
        assert(invCount >= spec.rules.minInvariants, `${group}/${doc}: needs ≥${spec.rules.minInvariants} invariants (I1:), found ${invCount}`);
      }
      if (spec.rules.minOracles) {
        const oracleCount = countMatches(content, /\*\*O\d+:/g);
        assert(oracleCount >= spec.rules.minOracles, `${group}/${doc}: needs ≥${spec.rules.minOracles} oracles (O1:), found ${oracleCount}`);
      }
      if (spec.rules.requireQuoteAndURL) {
        const hasQuote = content.includes("Quote:");
        const hasURL = content.includes("https://");
        assert(hasQuote && hasURL, `${group}/${doc}: each pain needs Quote + Source URL`);
      }
      if (spec.rules.requirePricingWithCurrency) {
        const hasCurrency = /\$|€|£/.test(content);
        assert(hasCurrency, `${group}/${doc}: pricing table must have $/€/£`);
      }
    }
  }
}

// Check joint files exist
for (const jf of ["joint/decisions.log.md", "joint/ledger.jsonl", "agent/context.md", "agent/status.md"]) {
  if (!exists(path.join(lcRoot, jf))) warnings.push(`${jf}: missing (auto, will be generated on sync)`);
}

// Output
console.log("─ Leancraft Validate ─");
console.log(`Checked: ${checked} assertions`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
}
if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach(e => console.log(`  ✖ ${e}`));
  console.log(`\nResult: FAIL — Lock blocked. Fix errors, then re-run.`);
  process.exit(1);
} else {
  console.log(`\nResult: PASS — Lock allowed. (warnings: ${warnings.length})`);
  if (config.locked) console.log("Note: config.json locked=true — human/** is READ-ONLY for agent.");
  process.exit(0);
}
