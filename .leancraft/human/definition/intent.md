# Intent — Global Executable Spec

> Status: DRAFT — Distilled from 06-prd.md. Agent codes ONLY against this.

## Intent

[TODO: 1 paragraph, distilled from 06-prd.md]

## Invariants (≥3, machine-checkable)

- **I1:** [e.g., totalChargesInScope == SUM(lineItems where scopeId==X)] — Check: `npm run test:invariants`
- **I2:** [e.g., PDF must be WCAG AA] — Check: `axe-core`
- **I3:** [e.g., Never string-concat SQL] — Check: `semgrep`

## Oracles (≥2)

- **O1:** Property test — `fast-check` 500 random inputs
- **O2:** Security — CodeQL/Semgrep passes

## Non-Goals

- Not:

## Source Trace

- FR-01, FR-05; Success Metric: Activation; Assumption: [from 06-prd.md]; Persona P1

## Validation

- [ ] ≥3 invariants with Check
- [ ] ≥2 oracles with tool
