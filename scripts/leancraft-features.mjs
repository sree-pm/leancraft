#!/usr/bin/env node
// leancraft features — generate 1 doc per flow from 06-prd.md + 1 per built feature in code
// Usage: node scripts/leancraft-features.mjs

import fs from "fs";
import path from "path";

const root = process.cwd();
const prdPath = path.join(root, ".leancraft/human/discovery/06-prd.md");
const featuresDir = path.join(root, ".leancraft/human/definition/features");
const templatePath = path.join(root, ".leancraft/templates/definition/feature.md");

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

const prd = fs.existsSync(prdPath) ? fs.readFileSync(prdPath, "utf8") : "";
const flows = [...prd.matchAll(/^###\s+Flow\s*\d*\s*:\s*(.+)$/gm)].map(m => m[1].trim());
const flowsAlt = [...prd.matchAll(/^###\s+Flow\s+(.+)$/gm)].map(m => m[1].trim());
const allFlows = flows.length ? flows : flowsAlt;

console.log(`Found ${allFlows.length} flows in 06-prd.md`);
if (allFlows.length === 0) {
  console.log("No flows found — fill 06-prd.md first (>=3 flows).");
  // Also scan code for built features as fallback
}

fs.mkdirSync(featuresDir, { recursive: true });
const existing = fs.existsSync(featuresDir) ? fs.readdirSync(featuresDir).filter(f => f.endsWith(".md")) : [];
console.log(`Existing feature docs: ${existing.join(", ") || "(none)"}`);

let created = 0;
for (let i = 0; i < allFlows.length; i++) {
  const flowName = allFlows[i];
  const slug = slugify(flowName);
  const fileName = `${String(42 + i).padStart(3, "0")}-${slug}.md`;
  const filePath = path.join(featuresDir, fileName);
  if (fs.existsSync(filePath)) {
    console.log(`  exists: ${fileName} → ${flowName}`);
    continue;
  }
  const template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "# Feature — [FILL]\n";
  const content = template
    .replace("042-example-feature", fileName.replace(".md", ""))
    .replace("[1 paragraph from 06-prd.md Flow N]", `Flow: ${flowName}\n\nDerived from 06-prd.md Flow ${i + 1}.`)
    + `\n<!-- Source Trace: Flow ${i + 1}: ${flowName} — fill FR-# + Persona -->\n`;
  fs.writeFileSync(filePath, content);
  console.log(`  created: ${fileName} → ${flowName}`);
  created++;
}

// Also scan half-built code for built features (simple heuristic: top-level src dirs or route files)
try {
  const srcDirs = fs.existsSync(path.join(root, "src")) ? fs.readdirSync(path.join(root, "src")).filter(f => fs.statSync(path.join(root, "src", f)).isDirectory()) : [];
  const builtFeatures = srcDirs.filter(d => !["components", "lib", "utils"].includes(d));
  if (builtFeatures.length > 0) {
    console.log(`\nBuilt features found in src/: ${builtFeatures.join(", ")}`);
    console.log(`If any built feature has no matching Flow in 06-prd.md, create a feature doc for it manually or add a Flow.`);
  }
} catch {}

console.log(`\nDone. Created ${created} missing feature docs. Run: npx leancraft validate`);
