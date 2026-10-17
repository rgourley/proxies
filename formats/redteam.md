# Format: redteam

Each proxy tries to break the artifact from their seat. There is no consensus step.

## One round, in parallel
Each proxy writes up to five breakages. Each breakage has:
- **Where**: the step, node, or screen.
- **How it breaks**: a concrete scenario with a specific client or attacker.
- **Severity**: critical, high, medium, low, judged from their seat.
- **Fix**: the smallest change that closes it.

If the run has a scenario, every breakage must relate to it.

Aim for about 80 words per breakage. Put your strongest breakage first.

## Premortem framing (only with --premortem)
One round, in parallel. It is six months after launch, and the artifact failed. Each proxy tells how it failed, from their seat, as a short story with dates and names. Then they write up to five causes, in the same shape as breakages: **Where**, **How it failed**, **Severity**, and **Fix**. Work back from the failure. Do not list risks that might happen. Say what did happen.

Aim for about 150 words for the story and about 80 words per cause.

## Facilitator
- Responses go to `01-attacks/<handle>.md`. With `--premortem`, run `brief.ts` with the round `01-premortem`, and responses go to `01-premortem/<handle>.md`.
- Merge duplicate breakages and keep the attribution of each one. Rank them by severity, then by how many seats found them. List every breakage, including the low-severity ones.
- Write `summary.md`: who blocks and why, the ranked findings table, and a section named "What to fix first": the fixes that answer the most findings and blocks, each with the proxies who raised it.
- A premortem summary starts with the failure stories that more than one proxy told.

## Verdict
Every response starts with one line after the title: `**Verdict**: <Block | Rework | Ship with changes | Ship>. <one sentence on why>.` Block means you would stop it from your seat. Rework means it must change before you would use or approve it.

## Language
Plain business English. Name each step by what it does, in words. Never use diagram node letters or IDs. Explain acronyms the first time.
