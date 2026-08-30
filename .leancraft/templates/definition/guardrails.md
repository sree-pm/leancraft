# Guardrails — Security, Perf, A11y, i18n

> REQUIRED: security, performance, a11y, i18n

## Security (from discovery/07-data.md if exists)

- **CWE-89 SQLi:** Never string-concat SQL, use `scopedQuery()` / parameterized
- **CWE-79 XSS:** Never `innerHTML`, use framework escape
- **Secrets:** Never commit `.env`, use `wrangler secret`
- **AuthZ:** Every query scoped by `userId + brandId`
- **Checks:** `semgrep`, `codeql`

## Performance

- Budget: LCP <2.5s, TTFB <600ms
- No N+1, paginate >100 rows
- Check: `autocannon`, `lighthouse`

## A11y

- WCAG AA, axe-core must pass
- No color-only indicators, ARIA labels required

## i18n

- No hardcoded strings, use `t()` keys
- Check: `i18n:check` script

## Validation

- [ ] 4 sections present
- [ ] Each has Check command
