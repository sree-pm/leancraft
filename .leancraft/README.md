# Leancraft — Doc-First Verified Agency

> `npm run leancraft:validate` must PASS before Lock. `human/**` is READ-ONLY when locked.

## Quick Start (human, first idea)

1. `npm run leancraft:validate` — see what's missing
2. Fill `human/discovery/*` (or `npx leancraft import notion --url <url>`)
3. Distill `human/definition/intent.md` from `06-prd.md`
4. `npm run leancraft:validate` → PASS
5. `npm run leancraft:lock` — or click [🔒 Lock] in chat
6. Agent now codes via `agent/proposals/` + auto `agent/status.md`

## Daily

- `npm run leancraft:sync` — regenerates `agent/context.md` + `agent/status.md` (also auto on commit)
- Agent needs change? It writes `agent/proposals/NNN-*.md` → you `[🔓 Unlock / ❌ Don't]`

## Ownership

- `human/**` — you own, agent READ-ONLY when locked
- `agent/**` — agent owns, you READ-ONLY
- `joint/**` — both append

See `.claude/skills/leancraft/SKILL.md` for agent prompt.
See `config.json` for registry (which docs, which sections, min counts).
