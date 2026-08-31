# Audit — 25 Vibe-Coding Failures Leancraft Fixes

Evidence-based, 50+ sources. See the full audit in the original research (Aug 30 2026) — summarized here:

1. Context rot (50% window)
2. Long-horizon amnesia (1hr)
3. Brownfield blindness (63% lack context)
4. Multi-file refactor failure
5. Non-determinism
6. Capability cliffs
7. Reward hacking (100% on some tasks)
8. Sycophancy
9. "I'm done!" lie
10. Infinite loops & token burn
11. Ghost edits
12. Prompt injection
13. Tests that test nothing (80% weak)
14. Documentation fiction
15. Locally elegant, globally incoherent
16. Hallucinated APIs (19.6%)
17. Insecure by default (62% vuln)
18. DB migration disasters
19. Secrets exfiltration
20. Works in sandbox, breaks in prod
21. Wrapper moat is zero
22. Benchmark theatre (SWE-Bench 70% → 0% mergeable)
23. Infinite monkeys
24. Privilege escalation
25. No accountability

Full sources: Tihanyi et al., Veracode, CodeRabbit, METR, Stack Overflow 2025, USENIX, GitClear, etc. See `README.md` Why and `AGENTS.md` research map.

Leancraft fixes each with: locked `human/**` + tight registry + validate + guard-write + budget + context.md + proposals.
