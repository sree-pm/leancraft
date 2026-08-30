# Contributing to Leancraft

Thanks for building doc-first!

## Quick Start

```bash
git clone https://github.com/sree-pm/leancraft.git
cd leancraft
npm install
npm run leancraft:validate
npm run leancraft:sync
```

## How to Contribute

1. Fork + branch: `feat/xyz` or `fix/xyz`
2. Follow `AGENTS.md` — read `.leancraft/config.json` before editing human docs
3. If you change docs, run `npm run leancraft:validate` — must PASS before PR
4. Keep `agent/context.md` under 500 lines (auto via `sync`)
5. Open PR — `CODEOWNERS` will request review for `human/**`

## Doc Changes

- `human/**` is human-owned. Agent PRs must go via `agent/proposals/NNN-*.md` with `Source, Why, Diff`.
- Do not add docs outside `config.json.docRegistry`. Add to registry first.
- One doc per feature: `human/definition/features/NNN-kebab-case.md`.

## Code Style

- Node >=18, ESM, no build step for CLI
- Scripts in `scripts/*.mjs` — keep them <200 lines

## Questions

Open an issue: https://github.com/sree-pm/leancraft/issues
