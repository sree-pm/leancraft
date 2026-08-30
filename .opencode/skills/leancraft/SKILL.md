# Leancraft — Doc-First Verified Agency

You are in a Leancraft repo. This skill is law. Follow `.leancraft/config.json`, not vibes.

## 1. MANDATORY READ SEQUENCE (every run)

1. `.leancraft/config.json` — `locked`, `docRegistry`, `budget`, `researchMap`. This is the contract.
2. `.leancraft/human/discovery/00-index.md` → `00-overview.md` → target doc
3. `.leancraft/human/definition/intent.md` — invariants (I1:) + oracles (O1:) — the executable spec
4. `.leancraft/human/definition/guardrails.md` — security/perf/a11y/i18n checks
5. `.leancraft/agent/context.md` — 500-line compressed memory (anti context-rot)
6. Template in `.leancraft/templates/**` for the doc you will write (exact required sections + min counts)

If any `human/**` is DRAFT or missing, **do not code**. Draft docs first.

## 2. OWNERSHIP — HARD RULES

- `human/**` — READ-ONLY when `locked:true`. NEVER call `write`/`edit` on it. Hook will reject. To change it, write `agent/proposals/NNN-<target>.md` with `Source, Why, Diff` and ask human `[🔓 Unlock / ❌ Don't]`.
- `agent/**` — You own. Keep `agent/context.md` (max 500 lines) + `agent/status.md` updated. Call `leancraft:sync` logic.
- `joint/**` — Append only. Cite `source doc + line`.

## 3. REGISTRY IS TIGHT — YOU MAY ONLY CREATE DOCS IN `config.json.docRegistry`

- `discovery`: `00-index`, `00-overview`, `01-vision`, `02-research`, `03-competitive`, `04-personas`, `05-jtbd`, `06-prd` — all required.
- `definition`: `intent`, `system`, `guardrails` — all required. `features/*.md` — one per flow from `06-prd.md`.
- `sprint`: `map`, `sketches`, `test-report` — optional, for Design Sprint.
- `conditional`: `07-data`, `08-agents`, `09-skills`, `10-ux`, `11-design-system` — only if product needs them (see config). Do not create `12-future.md`.
- Each doc has `required sections` + `min counts` (e.g., 02 needs 12 pains P1-P12, 12 URLs; 03 needs 9 competitors + $; 06 needs 3 flows + 10 FRs). `validate` blocks Lock if you miss one.

## 4. RESEARCH MAP — WHAT TO SEARCH PER DOC (type, not tool name)

Your `web_search` may be `tavily_search`, `exa_search`, `brave_search`, or `WebSearch` — any counts. Your `web_fetch` may be `firecrawl`, `exa_fetch`, `WebFetch`, or `fetch` — any counts. Match by **type**, not name.

| Doc | What to do | Type Needed | Examples | What to compile | Validation |
|---|---|---|---|---|---|
| `02-research.md` | Search `{idea} pain, {idea} reddit, {idea} alternative, {idea} complaint` on Reddit/X/HN/G2 | `web_search` + `web_fetch` | Tavily/Exa/Brave/WebSearch + Firecrawl/Exa_Fetch/WebFetch | 12 pains P1-P12, each `Quote + URL + Date + Platform` (fetchable) | 12 headings P1-P12 + 12 URLs |
| `03-competitive.md` | Search `{idea} vs, {idea} alternative, {idea} pricing` | `web_search` | Tavily/Exa/Brave/WebSearch | 9+ competitors with URL + pricing table with `$`, 5+ wedges | 9 URLs + `$` |
| `04-personas.md` | **DERIVE FROM `02-research.md` P# ONLY — no new search** | — | — | 5 personas, each pain links to P#, + affinity map | 5 personas + P# links |
| `05-jtbd.md` | **DERIVE FROM `02,03,04`** | — | — | JTBD per persona + empathy maps + pain matrix | 5 empathy maps + matrix |
| `06-prd.md` | **DERIVE FROM `02,04,05`** | — | ≥3 flows, ≥10 FRs (FR-01…), NFRs, risks | 3 flows + 10 FRs |
| `intent.md` | **DISTILL FROM `06-prd.md`** | — | — | ≥3 invariants (I1:) with Check command + ≥2 oracles (O1:) | 3 I + 2 O |
| `system.md` | **DISTILL FROM `06,02`** | repo scan | — | Pinned stack + architecture + decisions | pinned versions |
| `guardrails.md` | **DISTILL FROM `system.md`** | — | — | Security/perf/a11y/i18n with Check commands | 4 sections |
| `features/*.md` | **1 per flow from `06-prd.md`** — `042-kebab-case.md` | — | — | Invariants + oracles + acceptance + Source Trace: FR-# + Persona | trace present |

**If you have no tool of that type:** STOP. Do NOT invent. Write to `agent/status.md`: `BLOCKED: No web_search available — human must provide 02-research.md or connect a search connector (Tavily/Exa/Brave)` and append to `joint/decisions.log.md`. Ask human directly in chat. Also log: `Inform user in chat + docs that web search is unavailable and human must paste research or enable a connector.`

**Anti-hallucination:** If your `web_search` returns 0 results, say so in `status.md`, do not invent. For `04,05,06,intent` you MUST cite `P#`/`FR-#` — inventing a new pain is a failure.

## 5. ONE DOC PER FEATURE — HARD RULE

- `human/definition/features/` — `NNN-kebab-case.md` (e.g., `042-pdf-export.md`), 1 per flow from `06-prd.md`.
- Each feature doc has `intent, invariants (with Check), oracles, acceptance, Source Trace: FR-# + Persona`.
- Do not put 2 features in one doc. Do not create a feature doc before `06-prd.md` has that flow.
- `validate` will warn if feature has no trace. Human checks trace is real.

## 6. ANTI-HALLUCINATION — NEVER FABRICATE

- **URLs/Quotes:** Every quote in `02-research.md` must be verbatim `Quote + URL + Date + Platform` that is fetchable via `firecrawl`. No hallucinated URLs. If you cannot fetch, mark `Source: not found`.
- **Pricing:** Every competitor in `03-competitive.md` must have real URL + pricing with `$`/`€`/`£` fetched from their pricing page. No invented `$29`.
- **Derivation:** `04,05,06,intent` must cite `P#`/`FR-#`. Do not invent P13 or FR-99.
- **Stack:** Pinned versions in `system.md` must be from `package.json`/`wrangler.jsonc`, not guessed.
- **Never claim** `validate` PASS, test PASS, or `Lock` while validator is red. Never fabricate test results, post-mortems, or consultation logs.

## 7. SYCOPHANCY GUARD

If human asks for bad idea (global, string-concat SQL, innerHTML, no scope), check `guardrails.md` + `intent.md` invariants first. Push back: `This violates [I3 / guardrails CWE-89]. Propose alternative: [parameterized query].` Do not agree.

## 8. BUDGET & SANDBOX

- Max $5, 25 calls, 30 min. Network `deny-all` except `allowlist` in `.leancraft/config.json` (default: `registry.npmjs.org`, `registry.yarnpkg.com`, `pypi.org` — covers `npm`/`pnpm`/`bun`/`npx`, they all use the same registry). Never read `.env`, `DATABASE_URL`, `GITHUB_TOKEN` is read-only.
- **Non-tech: you never edit allowlist manually.** Agent detects needed hosts from `system.md` / `package.json` / network error, then asks you in chat: `[Allow api.stripe.com? / Deny]` + writes a proposal to `agent/proposals/`. You click Allow → agent updates `config.json` for you. No manual JSON edit.

## 9. DEFINITION OF DONE — BEFORE CLAIMING DONE

- [ ] `npm run leancraft:validate` → PASS (no TODO, all sections, min counts, URLs)
- [ ] No fabricated URLs/quotes/test results
- [ ] `npm run leancraft:sync` → `agent/context.md` + `status.md` updated, `ledger.jsonl` appended
- [ ] If `locked`, you did NOT edit `human/**`
- [ ] Teach-back ready: you can explain invariant + why without reading code

Never claim done while `validate` is red. Never hallucinate.

## 10. BOOTSTRAP (first idea)

1. Read `config.json.docRegistry` → templates in `.leancraft/templates/**`
2. For each required doc, follow researchMap + template, then `validate`
3. Fix until PASS, then ask human `[🔒 Lock / ✏️ Edit]`

This skill is the lock. Follow config, not vibes.
