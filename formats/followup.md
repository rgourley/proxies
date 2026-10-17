# Format: followup

A rerun of an earlier meeting on a revised artifact. One round, in parallel.

Each proxy gets their own round 1 and round 2 output from the earlier run, plus the revised artifact. It does not get anyone else's earlier output.

Each proxy writes:
- **Earlier position**: one line, quoted from their own response.
- **Objections, one by one**: for each objection or block condition they raised, mark it resolved, partly resolved, or open. Cite the step, node, or screen in the revision.
- **New issues**: anything the revision introduced.
- **Position now**: support, support with changes, or oppose.

A proxy marks an objection resolved only when the revision changes what it objected to. A note that says "we will handle it later" does not resolve it.

Aim for about 300 words. Give each objection one or two sentences.

## Facilitator
- Create a new run with format `followup`. Write the earlier run's folder path, relative to the repo, to `previous.txt`. Use the earlier run's question and attendees, and its `--dissenter`, unless the user passes new flags. `brief.ts` gives each proxy only their own earlier responses.
- Responses go to `01-followup/<handle>.md`.
- Write `summary.md`: a table with one row per objection, who raised it, and resolved, partly resolved, or open. Then new issues and position changes. If a veto is still open, say so in the first line.

## Verdict
Every response starts with one line after the title: `**Verdict**: <Block | Rework | Ship with changes | Ship>. <one sentence on why>.` Block means you would stop it from your seat. Rework means it must change before you would use or approve it.

## Language
Plain business English. Name each step by what it does, in words. Never use diagram node letters or IDs. Explain acronyms the first time.
