# Proposals — Agent Wants to Change human/*

Agent cannot edit `human/**` when `locked: true`. Instead it writes here:

```
agent/proposals/001-update-intent-add-I4.md
```

Format:

```md
# Proposal: Update intent.md — Add I4

Source: 02-research.md P7
Change: Add I4: [invariant] — Check: `npm run ...`
Why: [1 paragraph]
Diff:
- I3: ...
+ I4: ...
```

Human: review → `git merge` the proposal (or click Unlock in chat) → `leancraft sync` re-locks.

Human unlock is explicit: `npm run leancraft:unlock` or chat button [🔓 Unlock].
