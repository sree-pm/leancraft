# 00 — Index — Reading Order & Conventions

> Status: DRAFT — Run `npm run leancraft:validate` before Lock

## Reading Order

1. `00-overview.md` → elevator pitch + stack + cost ceiling
2. `01-vision.md` → north star, 10x-vs-parity, 3-year
3. `02-research.md` → P1-P12 pain themes (12 real quotes + URLs)
4. `03-competitive.md` → 9+ competitors + pricing + wedges
5. `04-personas.md` → 5 personas + affinity map
6. `05-jtbd.md` → JTBD + empathy maps + pain matrix
7. `06-prd.md` → goals, non-goals, flows, FRs, NFRs
8. `../definition/intent.md` → invariants + oracles (executable)
9. `../definition/system.md` → architecture
10. `../definition/guardrails.md` → security/perf/a11y/i18n
11. `../definition/features/*.md` → per-flow specs (ephemeral)

## Conventions

- `human/discovery/**` — PM-owned, agent READ-ONLY after Lock
- `human/definition/**` — Tech-owned, agent READ-ONLY after Lock
- `agent/**` — Agent-owned, auto-generated, human READ-ONLY
- `joint/**` — Both append (decisions, test reports)

## Status Legend

- `DRAFT` — agent drafted, human not yet approved
- `LOCKED` — human approved, agent must use `agent/proposals/` to suggest changes
- `AUTO` — regenerated on `leancraft sync`

## Agent Usage

Agent MUST read `config.json` → this file → `00-overview.md` → target doc, in order. Never skip.
Run `npm run leancraft:validate` before asking to Lock.

## Validation

- [ ] All 4 sections present
- [ ] No TODO/TBD
