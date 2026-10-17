# Ontology

These are the names for every part of Proxies. Use these terms in files, code, commands, and the results page. Do not use synonyms. When a term is not here, add it here first.

"Proxies" is the name of the product, and a **proxy** is the thing it holds: a simulated stakeholder for one role in one org. A proxy stands in for a role. It does not represent a real individual.

## Orgs and proxies

| Term | Definition | Where it lives |
|---|---|---|
| **Org** | A set of proxies who review together. An org has a `type`. A `company` org has a business, rules, culture, and decision rights. A `group` org has proxies and a purpose only. | `orgs/<org>/org.md` |
| **Proxy** | One simulated stakeholder for one role in one org. | `orgs/<org>/proxies/<handle>.md` |
| **Handle** | The short id of a proxy, unique in the org. It names the proxy's files. | the `handle` field |
| **Seat** | The role template that a proxy starts from, such as `compliance` or `engineering`. | `seats/<seat>.md` |
| **Decision level** | The weight of a proxy in a decision: `owner`, `veto`, `approve`, `consult`, or `inform`. The page shows these as Decision owner, Veto holder, Approver, Consulted, and Informed. | the `decision` field |
| **Use case** | One way that an org uses the thing under review. A proxy lists the use cases that apply to it. | `use_cases` in `org.md`, `uses` on a proxy |
| **Calibration** | A log of edits to a proxy after a comparison with real feedback from someone in the same role. | `orgs/<org>/calibration/<handle>.md` |

## Knowledge

| Term | Definition | Where it lives |
|---|---|---|
| **Knowledge** | A saved collection of material that someone knows, such as research papers or a project's spec. A collection has an index and its sources. It is never the thing under review. | `knowledge/<id>/` |
| **Index** | The short entry point of a collection: what it is, its key points, and which source supports each point. A proxy reads the index first. | `knowledge/<id>/index.md` |
| **Source** | One saved document in a collection. Each source starts with its title, its link, and the date it was last edited. | `knowledge/<id>/sources/` |
| **Expertise** | Knowledge that a proxy or an org knows. The proxy applies it and does not review it. | `knows` on a proxy or in `org.md` |
| **Context** | Knowledge that every proxy in one run reads before the review, such as the spec for the project under review. | `context` in a run's `meta.md` |

## Runs

| Term | Definition | Where it lives |
|---|---|---|
| **Artifact** | The thing under review: a flow, a spec, a prototype, or screenshots. It is copied into the run. | `runs/<run>/input/` |
| **Format** | A review procedure, such as `redteam`, `meeting`, or `prep`. | `formats/<format>.md` |
| **Command** | One `/proxies` action. Some commands run a format. Others manage orgs, proxies, and knowledge. | `.claude/skills/proxies/SKILL.md` |
| **Run** | One use of a format: the proxies, the artifact, and any context. | `runs/<run>/` |
| **Round** | One step of a format. Each round has a numbered folder. | `runs/<run>/<NN>-<round>/` |
| **Briefing** | The text that one proxy receives for one run: seat, org, proxy, expertise, and format. | `runs/<run>/prompts/<handle>.md` |
| **Response** | What one proxy writes in one round. | `runs/<run>/<NN>-<round>/<handle>.md` |
| **Verdict** | The first line of a response: Block, Rework, Ship with changes, or Ship. | the `**Verdict**:` line |
| **Summary** | The facilitator's write-up of a run. | `runs/<run>/summary.md` |
| **Decision** | The owner's ruling at the end of a meeting. | `runs/<run>/decision.md` |
| **Facilitator** | The main Claude session. It runs formats and writes summaries. It never speaks as a proxy. | not a file |
| **Results page** | The page that shows every run and proxy for one org. | `runs.<org>.html`, built by `scripts/runs.ts` |
