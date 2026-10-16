# Ontology

These are the names for every part of Proxies. Use these terms in files, code, commands, and the results page. Do not use synonyms. When a term is not here, add it here first.

"Proxies" is the name of the product. Inside the product, a simulated stakeholder is a **person**. The human that a person imitates is the **real person**.

## People

| Term | Definition | Where it lives |
|---|---|---|
| **Org** | A set of people who review together. An org has a `type`. A `company` org has a business, rules, culture, and decision rights. A `group` org has people and a purpose only. | `orgs/<org>/org.md` |
| **Person** | One simulated stakeholder in one org. | `orgs/<org>/people/<handle>.md` |
| **Handle** | The short id of a person, unique in the org. It names the person's files. | the `handle` field |
| **Seat** | The role template that a person starts from, such as `compliance` or `engineering`. | `seats/<seat>.md` |
| **Decision level** | The weight of a person in a decision: `owner`, `veto`, `approve`, `consult`, or `inform`. The page shows these as Decision owner, Veto holder, Approver, Consulted, and Informed. | the `decision` field |
| **Use case** | One way that an org uses the thing under review. A person lists the use cases that apply to them. | `use_cases` in `org.md`, `uses` on a person |
| **Calibration** | A log of edits to a person after a comparison with what the real person said. | `orgs/<org>/calibration/<handle>.md` |

## Knowledge

| Term | Definition | Where it lives |
|---|---|---|
| **Knowledge** | A saved collection of material that someone knows, such as research papers or a project's spec. A collection has an index and its sources. It is never the thing under review. | `knowledge/<id>/` |
| **Index** | The short entry point of a collection: what it is, its key points, and which source supports each point. A person reads the index first. | `knowledge/<id>/index.md` |
| **Source** | One saved document in a collection. Each source starts with its title, its link, and the date it was last edited. | `knowledge/<id>/sources/` |
| **Expertise** | Knowledge that a person or an org knows. The person applies it and does not review it. | `knows` on a person or in `org.md` |
| **Context** | Knowledge that every person in one run reads before the review, such as the spec for the project under review. | `context` in a run's `meta.md` |

## Runs

| Term | Definition | Where it lives |
|---|---|---|
| **Artifact** | The thing under review: a flow, a spec, a prototype, or screenshots. It is copied into the run. | `runs/<run>/input/` |
| **Format** | A review procedure, such as `redteam`, `meeting`, or `prep`. | `formats/<format>.md` |
| **Command** | One `/proxies` action. Some commands run a format. Others manage orgs, people, and knowledge. | `.claude/skills/proxies/SKILL.md` |
| **Run** | One use of a format: the people, the artifact, and any context. | `runs/<run>/` |
| **Round** | One step of a format. Each round has a numbered folder. | `runs/<run>/<NN>-<round>/` |
| **Briefing** | The text that one person receives for one run: seat, org, person, expertise, and format. | `runs/<run>/prompts/<handle>.md` |
| **Response** | What one person writes in one round. | `runs/<run>/<NN>-<round>/<handle>.md` |
| **Verdict** | The first line of a response: Block, Rework, Ship with changes, or Ship. | the `**Verdict**:` line |
| **Summary** | The facilitator's write-up of a run. | `runs/<run>/summary.md` |
| **Decision** | The owner's ruling at the end of a meeting. | `runs/<run>/decision.md` |
| **Facilitator** | The main Claude session. It runs formats and writes summaries. It never speaks as a person. | not a file |
| **Results page** | The page that shows every run and person for one org. | `runs.<org>.html`, built by `scripts/runs.ts` |
