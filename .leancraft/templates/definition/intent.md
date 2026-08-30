# Intent — Global Executable Spec

> REQUIRED: intent, invariants (≥3), oracles (≥2), non-goals. This is the contract agents code against.

## Intent

[1 paragraph: what we are building, distilled from 06-prd.md]

## Invariants (≥3, machine-checkable)

- **I1:** [e.g., totalChargesInScope == SUM(lineItems where scopeId==X)] — Check: `npm run test:invariants`
- **I2:** [e.g., PDF must be WCAG AA] — Check: `axe-core`
- **I3:** [e.g., Never string-concat SQL] — Check: `semgrep --config guardrails`

## Oracles (≥2, how we prove invariants)

- **O1:** Property test — `fast-check` generates 500 random inputs, invariant holds
- **O2:** Security — CodeQL/Semgrep passes
- **O3:** Perf — `autocannon` <2s for 100 rows, no N+1

## Non-Goals

- Not: ...

## Source Trace

- Derived from: 06-prd.md FR-01, FR-05; Success Metric: Activation; Assumption: [from 06-prd.md]; 04-personas.md P1

## Validation

- [ ] ≥3 invariants with Check command
- [ ] ≥2 oracles with tool name
- [ ] Source trace to PRD/persona
