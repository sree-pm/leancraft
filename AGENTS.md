# AGENTS.md — Leancraft Doc-First Repo

> This file is auto-read by Claude Code, Opencode, Cursor. Do not skip.

You are in a **Leancraft** repo. This is a doc-first, human-owned system. Your job is to draft, not decide. Human locks, you propose.

## MANDATORY READ SEQUENCE (every run, no exceptions)

1. `.leancraft/config.json` — the registry. `locked`, `docRegistry`, `budget`, `researchMap`. This is law.
2. `.leancraft/human/discovery/00-index.md` → `00-overview.md` → target doc
3. `.leancraft/human/definition/intent.md` + `guardrails.md` — invariants + security rules you MUST obey
4. `.leancraft/agent/context.md` — 500-line compressed memory (anti context-rot)
5. Template in `.leancraft/templates/**` for the doc you are about to write

If any `human/**` is `DRAFT` or missing, **do not code**. Draft docs first, run `validate`, then ask to Lock.

## OWNERSHIP — HARD RULES

- `human/**` — READ-ONLY when `locked:true`. NEVER call `write`/`edit` on it. To change it, write `agent/proposals/NNN-<target>.md` with `Source, Why, Diff` and ask `[🔓 Unlock / ❌ Don't]`. Hook will reject direct edits.
- `agent/**` — You own. Keep `context.md` + `status.md` updated. Max 500 lines for `context.md`.
- `joint/**` — Append only, cite `source doc + line`.

## REGISTRY IS TIGHT — NO HALLUCINATION

- You may ONLY create docs listed in `config.json.docRegistry`. Do not invent `13-future.md`.
- Each doc has `required sections` + `min counts`. `validate` will block Lock if you miss one.
- **Never hallucinate URLs, quotes, or pricing.** Every quote in `02-research.md` needs verbatim `Quote + URL + Date + Platform` that is fetchable. Every competitor in `03-competitive.md` needs real URL + pricing with `$`. `validate` checks counts; human checks truth.

## RESEARCH MAP — WHAT TO SEARCH PER DOC (type, not tool name)

Your `web_search` may be `tavily_search`, `exa_search`, `brave_search`, or `WebSearch` — any counts. Your `web_fetch` may be `firecrawl`, `exa_fetch`, `WebFetch`, or `fetch` — any counts. Match by **type**, not name.

| Doc | Search / Derive | Type Needed | Examples | What to compile |
|---|---|---|---|---|
| `02-research.md` | Search `{idea} pain, {idea} reddit, {idea} alternative, {idea} complaint` on Reddit/X/HN/G2 | `web_search` + `web_fetch` | Tavily/Exa/Brave/WebSearch + Firecrawl/Exa_Fetch/WebFetch | 12 pains P1-P12, each with Quote + URL + Date |
| `03-competitive.md` | Search `{idea} vs, {idea} alternative, {idea} pricing` | `web_search` | Tavily/Exa/Brave/WebSearch | 9+ competitors with URL + pricing table ($), 5+ wedges |
| `04-personas.md` | **DERIVE FROM `02-research.md` P# ONLY** — no new search | — | — | 5 personas, each pain links to P#, + affinity map |
| `05-jtbd.md` | **DERIVE FROM `02,03,04`** | — | — | JTBD per persona + empathy maps + pain matrix |
| `06-prd.md` | **DERIVE FROM `02,04,05`** | — | — | ≥3 flows, ≥10 FRs (FR-01...), NFRs, risks |
| `intent.md` | **DISTILL FROM `06-prd.md`** | — | — | ≥3 invariants (I1:) with Check command + ≥2 oracles |
| `system.md` | **DISTILL FROM `06,02`** | repo scan | — | Pinned stack + architecture + decisions |
| `guardrails.md` | **DISTILL FROM `system.md`** | — | — | Security/perf/a11y/i18n with Check commands |
| `features/*.md` | **1 per flow from `06-prd.md`** — `042-kebab-case.md` | — | — | Invariants + oracles + acceptance + Source Trace |

**If you have no tool of that type:** STOP. Do NOT invent. Write to `agent/status.md`: `BLOCKED: No web_search available — human must provide 02-research.md or connect a search connector (Tavily/Exa/Brave)` and append to `joint/decisions.log.md`. Ask human directly in chat. Also log: `Inform user in chat + docs that web search is unavailable and human must paste research or enable a connector.`

**Anti-hallucination:** If your `web_search` returns 0 results, say so in `status.md`, do not invent. For `04,05,06,intent` you MUST cite `P#`/`FR-#` — inventing a new pain is a failure.

## ONE DOC PER FEATURE — HARD RULE

- `human/definition/features/` — `NNN-kebab-case.md` (e.g., `042-pdf-export.md`), 1 per flow from `06-prd.md`.
- Each feature doc has `intent, invariants (with Check), oracles, acceptance, Source Trace: FR-# + Persona`.
- Do not put 2 features in one doc. Do not create a feature doc before `06-prd.md` has that flow. `validate` will warn if feature has no trace.

## DEFINITION OF DONE — BEFORE CLAIMING DONE

- [ ] `npm run leancraft:validate` → PASS (no TODO, all sections, min counts, URLs)
- [ ] No fabricated URLs, quotes, or test results
- [ ] `npm run leancraft:sync` → `agent/context.md` + `status.md` updated, `ledger.jsonl` appended
- [ ] If `locked`, you did NOT edit `human/**`
- [ ] Teach-back ready: you can explain invariant + why without reading code

Never claim `done` while `validate` is red. Never fabricate.

## BUDGET & SANDBOX

- Max $5, 25 calls, 30 min. Network `deny-all` except `allowlist` in `.leancraft/config.json` (default: `registry.npmjs.org`, `registry.yarnpkg.com`, `pypi.org` — covers `npm`/`pnpm`/`bun`/`npx`, they all use the same registry). Never read `.env`, `DATABASE_URL`, `GITHUB_TOKEN` is read-only.
- **Non-tech: you never edit allowlist manually.** Agent detects needed hosts from `system.md` / `package.json` / network error, then asks you in chat: `[Allow api.stripe.com? / Deny]` + writes a proposal to `agent/proposals/`. You click Allow → agent updates `config.json` for you. No manual JSON edit.

Full skill: `.claude/skills/leancraft/SKILL.md` + `.leancraft/config.json`
