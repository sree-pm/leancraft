# System — Architecture & Decisions

> REQUIRED: stack, architecture, decisions, data-model

## Stack (pinned versions)

- Frontend: [e.g., Next.js 15.0.0, React 19]
- Backend: [e.g., Cloudflare Workers]
- DB: [e.g., D1, `wrangler.jsonc`]
- Infra:

## Architecture

```
[diagram: client → worker → D1, with boundaries]
```

## Decisions (ADRs distilled)

| Decision | Chosen | Rejected | Why |
|---|---|---|---|
| Auth | ... | ... | ... |

## Integrations / Dependencies (from 06-prd Stakeholders)

| System | API / Host | Why | Allowlist |
|---|---|---|---|
| ... | ... | ... | → config |

## Deployment / Infra (light)

- Hosting: ...
- Env: dev / staging / prod
- CI: ...

## Data Model

- Tables: ...
- PII handling: (links to discovery/07-data.md if exists)
- Agents: (links to 08-agents.md if exists)
- UX: (links to 10-ux.md if exists)

## Validation

- [ ] Pinned versions listed
- [ ] Architecture diagram present
- [ ] Decisions have why
