#!/usr/bin/env node
// leancraft validate — checks docRegistry tightness, no placeholders, min counts, URLs, sections
// Run: node scripts/leancraft-validate.mjs [--fetch]  (or npm run leancraft:validate)
// --fetch: also fetch each URL in 02-research/03-competitive and check HTTP 200 (truth check)
// Exit 0 = PASS (Lock allowed), 1 = FAIL (Lock blocked)

import fs from "fs";
import path from "path";

const root = path.resolve(process.cwd());
const lcRoot = path.join(root, ".leancraft");
const configPath = path.join(lcRoot, "config.json");
const doFetch = process.argv.includes("--fetch");

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
  // Check for unfilled template placeholders — [FILL: ...] is the marker after init
  if (/\[FILL:/.test(content)) errors.push(`${file}: contains unfilled placeholder [FILL: — fill it, then re-run validate`);
  // Also catch legacy TODO/TBD if human adds it
  if (/\bTODO\b|\bTBD\b/.test(content) && !file.includes("templates/")) {
    // Only warn for human files with TODO outside [FILL: context — could be a task
    if (/TODO|TBD/.test(content) && content.includes("[FILL:")) {
      // already reported above
    } else if (/\bTODO\b/.test(content)) {
      warnings.push(`${file}: contains TODO (ok if task, but will block Lock if [FILL: remains)`);
    }
  }
}

function normalizeSection(s) {
  return s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}

function checkSections(file, content, requiredSections) {
  if (!requiredSections) return;
  const normalizedContent = normalizeSection(content);
  for (const sec of requiredSections) {
    const needle = normalizeSection(sec);
    const has = normalizedContent.includes(needle);
    if (!has) errors.push(`${file}: missing required section "${sec}"`);
  }
}

function countMatches(content, regex) {
  return (content.match(regex) || []).length;
}

// Validate discovery + definition
let prdFlowCount = 0;
for (const [group, docs] of Object.entries(config.docRegistry)) {
  if (group === "conditional") continue;
  for (const [doc, spec] of Object.entries(docs)) {
    if (doc.includes("*")) {
      const dir = path.join(lcRoot, "human", "definition", "features");
      if (exists(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".md") && f !== "README.md");
        const realFeatures = files.filter(f => !f.includes("example"));
        if (realFeatures.length === 0 && prdFlowCount > 0) {
          errors.push(`human/definition/features/*.md: 06-prd.md has ${prdFlowCount} flows but no feature docs — create 1 per flow (042-kebab-case.md)`);
        } else if (files.length === 0) {
          warnings.push(`human/definition/features/*.md: no features yet (ok, ephemeral)`);
        }
        for (const f of files) {
          const content = read(path.join(dir, f));
          if (!content) continue;
          checkNoPlaceholders(`human/definition/features/${f}`, content);
          checkSections(`human/definition/features/${f}`, content, spec.sections);
          if (!content.includes("FR-") || !content.includes("Source Trace")) {
            warnings.push(`human/definition/features/${f}: missing Source Trace (FR-# + Persona)`);
          }
        }
      }
      continue;
    }
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

    if (spec.rules) {
      if (spec.rules.minPainThemes) {
        const count = countMatches(content, /^###?\s+P\d+/gm);
        assert(count >= spec.rules.minPainThemes, `${group}/${doc}: needs ${spec.rules.minPainThemes} pain themes (P1-P12), found ${count}`);
      }
      if (spec.rules.minSources) {
        const urlCount = countMatches(content, /https?:\/\//g);
        assert(urlCount >= spec.rules.minSources, `${group}/${doc}: needs ≥${spec.rules.minSources} URLs, found ${urlCount}`);
      }
      if (spec.rules.minCompetitors) {
        const hasTable = content.includes("|") && content.toLowerCase().includes("competitor");
        assert(hasTable, `${group}/${doc}: missing competitor table`);
        const rows = content.split("\n").filter(l => l.trim().startsWith("|") && !l.toLowerCase().includes("competitor") && !l.includes("---") && l.includes("https://")).length;
        if (rows < spec.rules.minCompetitors) {
          // Fallback count without URL requirement
          const altRows = content.split("\n").filter(l => l.trim().startsWith("|") && !l.toLowerCase().includes("competitor") && !l.includes("---")).length;
          assert(altRows >= spec.rules.minCompetitors, `${group}/${doc}: needs ≥${spec.rules.minCompetitors} competitors, found ~${altRows}`);
        }
      }
      if (spec.rules.minWedges) {
        const wedgeCount = countMatches(content, /^\d+\./gm);
        assert(wedgeCount >= spec.rules.minWedges, `${group}/${doc}: needs ≥${spec.rules.minWedges} wedges, found ${wedgeCount}`, true);
      }
      if (spec.rules.minPersonas) {
        const personaCount = countMatches(content, /^##\s+Persona/mg);
        if (personaCount < spec.rules.minPersonas) {
          const alt = countMatches(content, /Persona \d/mg);
          assert(alt >= spec.rules.minPersonas, `${group}/${doc}: needs ≥${spec.rules.minPersonas} personas, found ${personaCount} (alt ${alt})`);
        }
      }
      if (spec.rules.minUserFlows) {
        const flowCount = countMatches(content, /^###\s+Flow/mg);
        assert(flowCount >= spec.rules.minUserFlows, `${group}/${doc}: needs ≥${spec.rules.minUserFlows} user flows, found ${flowCount}`);
        if (group === "discovery" && doc === "06-prd.md") prdFlowCount = flowCount;
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

// --fetch: verify URLs are fetchable (truth check)
if (doFetch) {
  console.log("\n─ Fetch check (--fetch) ─");
  const filesToFetch = ["human/discovery/02-research.md", "human/discovery/03-competitive.md"];
  for (const rel of filesToFetch) {
    const content = read(path.join(lcRoot, rel));
    if (!content) continue;
    const urls = [...content.matchAll(/https?:\/\/[^\s\)\]]+/g)].map(m => m[0].replace(/[,;]$/, ""));
    const uniq = [...new Set(urls)].slice(0, 20); // cap 20 per file
    if (uniq.length === 0) continue;
    console.log(`  Fetching ${uniq.length} URLs from ${rel}...`);
    for (const url of uniq) {
      try {
        const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
        if (!res.ok) warnings.push(`${rel}: URL not fetchable (${res.status}) ${url}`);
        else checked++;
      } catch (e) {
        warnings.push(`${rel}: URL fetch failed ${url} — ${e.message}`);
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
console.log(`Checked: ${checked} assertions${doFetch ? " (+ fetch)" : ""}`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
}
if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach(e => console.log(`  ✖ ${e}`));
  console.log(`\nResult: FAIL — Lock blocked. Fix errors, then re-run.`);
  if (!doFetch) console.log(`Tip: Run with --fetch to also verify URLs are fetchable.`);
  process.exit(1);
} else {
  console.log(`\nResult: PASS — Lock allowed. (warnings: ${warnings.length})`);
  if (config.locked) console.log("Note: config.json locked=true — human/** is READ-ONLY for agent.");
  if (!doFetch) console.log(`Tip: Run with --fetch to verify URLs are fetchable (truth check).`);
  process.exit(0);
}
