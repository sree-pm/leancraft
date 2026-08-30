#!/usr/bin/env node
// Installs git hook that enforces human/** READ-ONLY when locked + runs sync
import fs from "fs";
import path from "path";

const hook = `#!/bin/sh
# leancraft pre-commit hook — enforces ownership + runs validate
set -e
LOCKED=$(node -p "JSON.parse(require('fs').readFileSync('.leancraft/config.json','utf8')).locked" 2>/dev/null || echo "false")
if [ "$LOCKED" = "true" ]; then
  # Check if agent (detected via env or staged files) tries to touch human/**
  if git diff --cached --name-only | grep -q "^.leancraft/human/"; then
    # Allow if human is committing (check git config user or LEANCRAFT_HUMAN env)
    if [ "$LEANCRAFT_HUMAN" != "1" ] && [ "$LEANCRAFT_AGENT" = "1" ]; then
      echo "✖ BLOCKED: .leancraft/human/** is LOCKED. Agent must write to .leancraft/agent/proposals/ instead."
      echo "  Human unlock: npm run leancraft:unlock  (or chat [🔓 Unlock])"
      exit 1
    fi
  fi
fi
# Always run validate as warning (don't block commit, just inform)
node scripts/leancraft-validate.mjs || echo "⚠ validate failed — fix before Lock"
`;

const hookPath = path.join(process.cwd(), ".git/hooks/pre-commit");
try {
  fs.writeFileSync(hookPath, hook, { mode: 0o755 });
  console.log("✓ pre-commit hook installed");
} catch (e) {
  console.log("Note: could not install hook (no .git/hooks):", e.message);
}
