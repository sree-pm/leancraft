# Security Policy

## Reporting

Please do not open public issues for security vulnerabilities. Email the maintainers or open a private security advisory: https://github.com/sree-pm/leancraft/security/advisories/new

We aim to respond within 48 hours.

## Scope

Leancraft is a doc-first scaffold + CLI. It does not run your code in production. The sandbox defaults are `deny-all` network, read-only `GITHUB_TOKEN`, and no `.env` access. If you find a bypass, report it.

## Supported Versions

`main` is supported. Pin `leancraft` version in `package.json`.
