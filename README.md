# Leancraft - Doc-First Verified Agency

> Stop vibe coding. Start owning.

**Leancraft is a doc-first scaffold that locks human intent and leashes agentic coding.** Your agent can draft 12 pains, 5 personas, 50 reqs — but it cannot ship until `validate` passes and you click Lock. After Lock, `human/**` is read-only; agent must propose.

Fixes the 25 vibe-coding failures (62% vulns, 9-sec DB wipes, 19% slowdown, context rot) with one `npx` install.

[![npm version](https://img.shields.io/npm/v/leancraft)](https://www.npmjs.com/package/leancraft) [![npm downloads](https://img.shields.io/npm/dm/leancraft)](https://www.npmjs.com/package/leancraft) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Why

Vibe coding: `Prompt → Code → Hope`. Leancraft: `Doc (locked) → Bounded Agency → Verification → Code is projection`.

- **Tight registry:** 13 docs with required sections + min counts (12 pains P1-P12, 9 competitors + $, 5 personas, 3 flows + 10 FRs). `validate` blocks Lock if you miss one.
- **Ownership:** `human/**` 🔒, `agent/**` 🤖 auto, `joint/**` 👥. Hook rejects agent writes to `human/**`.
- **Anti-hallucination:** Research map per doc — `02-research` must `web_search + web_fetch` (Tavily/Exa/Brave/WebSearch + Firecrawl/Exa_Fetch/WebFetch — any counts) on Reddit/X/HN/G2, each pain needs `Quote + URL + Date`. `03-competitive` needs real pricing with `$`.
- **One doc per feature:** `human/definition/features/042-kebab-case.md` — 1 per flow from PRD.

## Install — 1 Command

```bash
npx leancraft init
# scaffolds .leancraft/ + skills + hooks + .mcp.json
```

Or with npm:

```bash
npm install -D leancraft
npx leancraft init
```

## Quickstart (first idea)

```bash
# 1. Agent drafts docs (first time, unlocked)
# Prompt your agent: "Bootstrap from idea: Infonaut — $10/mo infobots for solo founders"

# 2. Human reviews, then:
npx leancraft validate   # must PASS (no TODO, all sections, min counts, URLs)
npx leancraft lock       # 🔒 human owns, agent read-only

# 3. Agent now codes
# Agent reads .leancraft/human/definition/intent.md + guardrails.md + agent/context.md
# Needs change? → writes agent/proposals/NNN-*.md → asks [🔓 Unlock / ❌ Don't]

# 4. Keep in sync
npx leancraft sync       # also auto on git commit

# Unlock if you must:
npx leancraft unlock
```

## Repo Layout After `init`

```
.leancraft/
├── config.json                         ← Registry: which docs, sections, budget, lock
├── human/                              ← 🔒 HUMAN-OWNED — agent READ-ONLY
│   ├── discovery/ 00-index, 00-overview, 01-vision, 02-research, 03-competitive, 04-personas, 05-jtbd, 06-prd
│   ├── definition/ intent.md, system.md, guardrails.md, features/*.md
│   └── sprint/ map.md
├── agent/                              ← 🤖 AUTO — human READ-ONLY
│   ├── context.md (500 lines, compressed memory)
│   ├── status.md (live tracker)
│   └── proposals/ (agent's PRs to human)
└── joint/ decisions.log.md + ledger.jsonl + test-report.md
```

See `.leancraft/README.md` for the full map. Templates live in `.leancraft/templates/**`.

## Agentic Tools — How To Connect

Leancraft works with any agent. Pick yours — same `init`, same docs.

### Claude Code

```bash
npx leancraft init
# Skills auto-installed to .claude/skills/leancraft/SKILL.md + CLAUDE.md + AGENTS.md
# Claude Code reads AGENTS.md on every run automatically
# MCP: uses .mcp.json (leancraft mcp server)
```

Verify: open Claude Code, type `/skills` → `leancraft` should appear.

### Cursor

```bash
npx leancraft init
# Rule auto-installed to .cursor/rules/leancraft.mdc (alwaysApply: true)
# Cursor reads it on every chat automatically
```

Also add MCP: Cursor Settings → Features → MCP → Add server → `node ./scripts/mcp-server.mjs` or point to `.mcp.json`.

### Opencode

```bash
npx leancraft init
# Skill auto-installed to .opencode/skills/leancraft/SKILL.md
# Opencode reads AGENTS.md at root automatically
```

### Windsurf / Codex / Cline

Any agent that reads `AGENTS.md` at repo root works out of the box. For MCP:

```bash
# .mcp.json is scaffolded. Point your agent's MCP config at:
node ./scripts/mcp-server.mjs
# Tools: leancraft_read_intent, leancraft_get_context, leancraft_propose_change, leancraft_validate
```

### GitHub Copilot / VS Code

Works as file-based guardrails — no MCP needed. Copilot reads `AGENTS.md` + `.leancraft/human/definition/intent.md` via workspace context. For best results, add `#file:.leancraft/human/definition/intent.md` to your prompt.

### Generic (any agent)

1. Ensure `AGENTS.md` at repo root exists (scaffolded by `init`)
2. Ensure `.leancraft/config.json` exists — it is the contract
3. Agent's first prompt should be: `Read AGENTS.md and .leancraft/config.json, then bootstrap discovery per registry`

## MCP

```bash
npx leancraft mcp   # prints .mcp.json snippet
```

`scripts/mcp-server.mjs` exposes:

- `leancraft_read_intent` — must call first (returns intent + guardrails + budget + registry)
- `leancraft_get_context` — compressed 500-line memory (anti context-rot)
- `leancraft_propose_change` — write to `agent/proposals/` when locked
- `leancraft_validate` — run registry checks

Add to your agent's MCP config:

```json
{ "mcpServers": { "leancraft": { "command": "node", "args": ["./scripts/mcp-server.mjs"] } } }
```

## CLI

```bash
npx leancraft --help
npx leancraft init [--force]
npx leancraft validate
npx leancraft sync
npx leancraft lock
npx leancraft unlock
npx leancraft status
npx leancraft mcp
```

## Validation

```bash
npm run leancraft:validate  # or npx leancraft validate
# Checks: required docs + required sections + min counts (12 pains, 9 competitors, 5 personas, 10 FRs, 3 invariants) + URLs + no TODO
# Exit 0 = PASS → Lock allowed, 1 = FAIL → Lock blocked
```

## Cost & ROI — Dogfooded

> Doc overhead is `3.2k` tokens/read (`~$0.01`), `30–40k` one-time to draft 13 docs. Per feature it saves `~10k` tokens & `~0.7h` after 2 features — measured on this repo itself (`45k chars / 11.3k tokens` total on disk, `3.2k` per run, 2026-08-30).

Assumptions: Claude pricing ($3/$15 per 1M), 1 feature = `10k` gen + `15k` debug vibe vs `13k` doc-first. Based on METR -19% slowdown without context and GitClear 41% churn. Your stack will vary — track `joint/ledger.jsonl` $/feature and `agent/status.md` time to verify. PR your numbers — we publish community ROI.

## Ownership

- `human/**` — READ-ONLY when `locked:true` (see `.github/CODEOWNERS`, `.git/hooks/pre-commit`). Agent must propose.
- `agent/**` — Agent owns, auto-generated
- `joint/**` — Both append

## Contributing

See `CONTRIBUTING.md`. Run `npm run leancraft:validate` before PR.

## License

MIT — see `LICENSE`.

## Roadmap

- `leancraft import notion --url <url>` — import PM docs into `human/discovery/`
- `leancraft validate --fetch` — firecrawl URL fetch check (hallucination guard)
- Semgrep + axe + CodeQL wiring in `leancraft:security`
