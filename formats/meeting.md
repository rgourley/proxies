# Format: meeting

A decision meeting about one artifact and one question.

## Round 1: blind review
Run every attendee in parallel. No attendee sees another's output.

Each proxy writes:
- **Position**: support, support with changes, or oppose. One line.
- **Reasoning**: what they see in the artifact, from their seat. Cite specific steps, nodes, or screens.
- **Block condition**: what would make them block this. "None" is allowed only for consult and inform roles.
- **The one change**: the single change they would demand.
- **Confidence**: 1 to 5.

## Round 2: rebuttal
Run every attendee in parallel again. Each one gets the round 1 output of all the others as attributed quotes.

Each proxy writes:
- Who they agree with and why, by name.
- Who they push back on and why, by name.
- Whether their position changed. If it changed, the specific argument that changed it.

A proxy does not change position because others disagree. It changes only when someone answers its block condition.

## Round 3: decision
Run the decision owner once more. They get both rounds. The decision owner is the `owner` handle in the run's `meta.md`.

They write:
- **Decision**: ship, ship with changes, rework, or stop.
- **Required changes**, each with an owner seat.
- **Open blocks**: any veto still standing. The owner cannot overrule a veto. An open veto means the result is "escalate to joint review."

## Minority report
The facilitator writes this, not a proxy. It lists every position that lost, quoted from the files, with the strongest version of each argument. It is never empty. If everyone agreed, it records the weakest point of agreement.

## Verdict
Every response starts with one line after the title: `**Verdict**: <Block | Rework | Ship with changes | Ship>. <one sentence on why>.` Block means you would stop it from your seat. Rework means it must change before you would use or approve it.

## Language
Plain business English. Name each step by what it does, in words. Never use diagram node letters or IDs. Explain acronyms the first time.
