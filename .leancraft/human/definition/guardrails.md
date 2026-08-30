# Guardrails — Security, Perf, A11y, i18n

> Status: DRAFT — Agent MUST obey. CI enforces.

## Security

- CWE-89 SQLi: Never string-concat SQL, use parameterized / scopedQuery()
- CWE-79 XSS: Never innerHTML
- Secrets: Never commit .env, use wrangler secret
- AuthZ: Every query scoped by userId + brandId
- Checks: semgrep, codeql

## Performance

- LCP <2.5s, no N+1, paginate >100
- Checks: autocannon, lighthouse

## A11y

- WCAG AA, axe-core must pass
- No color-only, ARIA labels required

## i18n

- No hardcoded strings, use t() keys

## Validation

- [ ] 4 sections present
- [ ] Each has Check command
