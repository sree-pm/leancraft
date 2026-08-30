# 00 — Index — Reading Order & Conventions

> REQUIRED SECTIONS: reading-order, conventions, status-legend, agent-usage

## Reading Order

1. `00-overview.md` → elevator pitch
2. `01-vision.md` → north star
3. `02-research.md` → pain themes (P1-P12)
4. `03-competitive.md` → teardown
5. `04-personas.md` → who we serve
6. `05-jtbd.md` → jobs + empathy maps
7. `06-prd.md` → goals, flows, reqs
8. `../definition/intent.md` → invariants + oracles (executable)
9. `../definition/system.md` → architecture
10. `../definition/guardrails.md` → security/perf/a11y
11. `../definition/features/*.md` → per-flow specs (ephemeral)

## Conventions

- `human/discovery/**` — PM-owned, agent READ-ONLY
- `human/definition/**` — Tech-owned, agent READ-ONLY (distilled from discovery)
- `agent/**` — Agent-owned, auto-generated
- `joint/**` — Both append

## Status Legend

- `DRAFT` — agent drafted, human not yet approved
- `LOCKED` — human approved, agent cannot edit (needs `proposals/` + human unlock)
- `AUTO` — agent-owned, regenerated on `leancraft sync`

## Agent Usage

Agent MUST read `config.json` → `00-index.md` → `00-overview.md` → target doc, in order. Never skip.
Run `npm run leancraft:validate` before asking to Lock.

## Validation

- [ ] All 4 sections present
- [ ] No `TODO` / `TBD` placeholders
