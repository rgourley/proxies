<img width="1456" height="816" alt="image-1792012644362" src="https://github.com/user-attachments/assets/6fc0e66d-b9ad-4642-a903-7b790b196aa8" />

# Proxies: simulated stakeholder reviews in Claude Code

A simulated room of stakeholders you run an idea, prototype, or design concept past before the real meeting. Each person has a card: role, incentives, hard lines, blind spots, voice. You give them a flow, spec, or prototype, and each one tells you where it breaks for them.

Proxies are simulations. They show the concerns a role would likely raise. They do not predict what a real person says.

<img width="1054" height="757" alt="Screenshot 2026-10-14 at 2 33 48 PM" src="https://github.com/user-attachments/assets/9957a5a7-6f9f-4307-8e15-f7922365131c" />

## Why not just ask for five personas in one prompt

- Each person runs as a separate agent that sees only their own card, so they don't blur into one agreeable voice.
- The people are saved and reused, and you can correct them against what the real person said.
- They review against the real spec and decision docs, not a stale draft.
- Formats force an outcome: blind positions, then rebuttals, then a decision, with the dissent recorded.
- Every run lands on one results page: who blocks, what's critical, what fixes it. See [The results page](#the-results-page).

## Setup

You need Node 22 or later and Claude Code. There is nothing to install.

```bash
git clone https://github.com/rgourley/proxies.git
cd proxies
claude
```

Claude Code loads the `/proxies` skill and the person agent from `.claude/` when it starts in this folder. Start a new session after you clone or pull, so it picks up changes to either. Then run `/proxies use tilt` to check that it works.

<img width="1050" height="608" alt="Screenshot 2026-10-14 at 2 35 10 PM" src="https://github.com/user-attachments/assets/549a67b7-7cc8-444d-b758-d6a829ac4761" />

## Commands

Run from this folder in Claude Code. Full details live in `.claude/skills/proxies/SKILL.md`.

| Command | What it does |
|---|---|
| `/proxies use <org>` | Pick the org and list its people |
| `/proxies redteam <file> "<scenario>"` | Everyone tries to break it |
| `/proxies meeting <file> "<question>"` | Debate, then the decision owner calls it |
| `/proxies prep <file>` | Each person's top questions |
| `/proxies followup <run> <file>` | Check whether a revision answered their objections |
| `/proxies compare <a> <b>` | Each person picks a version |
| `/proxies ask <person> "<question>"` / `talk <person>` | Talk to one person |
| `/proxies calibrate <person>` | Tune a card against what the real person said |
| `/proxies org new <id> "<description>"` | Create a company org. Add `--group` for an ad hoc group |
| `/proxies new <handle> <seat>` | Add a person to the active org |
| `/proxies clone <handle> --to <org>` | Copy a person into another org and adapt them |
| `/proxies knowledge new <id>` / `add <id> <url or file>` / `refresh <id>` | Build a knowledge collection |
| `/proxies export <org>` / `import <file>` | Share an org as one JSON file |
| `/proxies pages` | Rebuild and republish the results page |

Flags for the run commands:

| Flag | What it does |
|---|---|
| `--org <id>` | Use this org instead of the active one |
| `--use <id>` | Invite only the people whose `uses` list has this use case |
| `--with a,b,c` | Invite exactly these people. Overrides `--use` |
| `--dissenter <handle>` | This person holds their position unless someone answers their block |
| `--no-decision` | End a meeting after the rebuttals, with no decision round |
| `--wordy` | Drop the word targets, so each person writes at full length |
| `--noui` | Show the results in chat and do not open the page |

After a run, the results page opens by default. Chat shows only the verdict and the run folder.

All feedback is in plain business English.

## Making your own org and people

Describe the company, and Claude drafts the org:

```
/proxies org new acme "Mid-size insurer, 4,000 staff, buying a claims tool. Regulated by state insurance boards. IT and compliance can veto vendors."
```

It writes `orgs/acme/org.md`: the business, rules, culture, who decides what, and the company's vocabulary. Anything it guessed is marked "(assumed)", and you see the draft before it saves.

Then add people one at a time. Each gets a handle and a seat, which is the role template they start from:

```
/proxies use acme
/proxies new dana compliance
```

Claude asks for the name and title and drafts the rest. The seats live in `seats/`, and you can add your own. `/proxies clone dana --to acme` adapts a person from another org.

Each person has a `decision` level: `owner` decides, `veto` can block, `approve` must sign off, `consult` gives input, and `inform` is kept in the loop. Everything is plain markdown, so you can also edit the files by hand. Copy `orgs/tilt/` to start.

When the real person would have said something different, run `/proxies calibrate dana "what they actually said"`. Claude proposes edits to their file and logs the change.

Each person gets a generated avatar in the style of the Proxies illustration. Their pronouns choose the hair and clothes, and the same person always gets the same avatar. To set it yourself, add any of these to the person file: `avatar_hair` (bob, bun, ponytail, long, short, curls, scarf, side, buzz, bald, receding, quiff), `avatar_top` (blazer, suit, turtleneck, vneck, dress), `avatar_facial_hair` (none, beard, mustache, stubble), and `avatar_glasses` (none, round, square). To get a different random avatar, add `avatar_seed` with any text.

## Knowledge

Knowledge is what people know. The artifact is what they judge. The two never mix: knowledge lives in `knowledge/`, and the artifact is copied into each run's `input/` folder.

A collection is one folder: `index.md` says what it is and lists its key points, each tied to a source, and `sources/` holds a saved copy of each document with its link and last-edited date. People read the index first and open a source only when a point depends on it.

```
/proxies knowledge new cardiology-trials "Phase 3 trials for the drugs in our intake flow"
/proxies knowledge add cardiology-trials https://example.org/trial-a.pdf ~/research/trial-b.md
```

A collection is used in one of two ways:

- **Expertise.** `knows: [cardiology-trials]` on a person, or in `org.md` for everyone, means they know it. They apply it and cite it, but they don't review it. People without it don't get it, so the cardiologist and the compliance officer in the same run know different things.
- **Context.** `context: cardiology-trials` in a run's `meta.md` means every person in that run reads it before the review. Use this for the spec of the project under review.

The same collection can be expertise in one run and context in another. `/proxies knowledge refresh <id>` pulls every source again from its link.

## Groups

Not every review is a company. An ad hoc group is an org with people and a purpose, and no business, culture, or decision rights:

```
/proxies org new options-panel --group "Retail and professional options traders who test trading tools"
```

Groups use the same commands. A group has no decision owner, so a meeting needs `--no-decision` or an owner you name.

## The results page

The page opens on its own after every run. To build and open it by hand:

```bash
npm run pages
open runs.html
```

Each run shows who blocks, the ranked findings, what to fix first, and every person's full response. Click any name to open that person's card. `npm run pages -- --org tilt` builds a page with one org. `/proxies pages` republishes it as a private Claude artifact that you share from its Share menu.

## Sharing an org

An org exports to one JSON file with its people, their calibration logs, and the seats they use:

```bash
npm run export-org -- tilt
npm run import-org -- tilt.proxies.json
```

In Claude Code, use `/proxies export tilt` and `/proxies import tilt.proxies.json`. The page's **Export** button copies the same JSON, and `/proxies import` with no file reads it from the clipboard on macOS.

The import never overwrites an existing org. Add `--as <new-id>` to import it under another name. If a seat differs from your copy, the import stops and names it.

## Sample orgs

Three fictional orgs ship with the repo so you can try it right away. `tilt` is a SaaS company that makes a project planning tool. `brightpath` is a 14-site clinic network. `northpine` is a game studio that runs one live game and is building its next one. They hold people only. You bring the thing to review:

```
/proxies use tilt
/proxies redteam path/to/your-flow.mmd "an agency invites 30 client reviewers"
```

Git does not keep a client org out of the repo by default. List client orgs, knowledge, and runs in `.git/info/exclude`. That file stays on your machine and is never pushed:

```
orgs/acme/
knowledge/acme-*/
runs/*acme*/
```

## Layout

[ONTOLOGY.md](ONTOLOGY.md) defines every term below.

```
seats/                  role templates that every org reuses
orgs/<org>/org.md       the org: type, business, rules, culture, decision rights, vocabulary
orgs/<org>/people/      one file per person; frontmatter feeds the card
orgs/<org>/calibration/ one log per person: real quotes, misses, and the edits they caused
knowledge/<id>/         a collection: index.md plus sources/
formats/                the review procedures: meeting, redteam, prep, followup, compare, ask/talk, calibrate
runs/<run>/             meta.md, input/ (the artifact), one folder per round, summary.md
.claude/agents/         the person agent (one person per subagent)
.claude/skills/proxies/ the facilitator's instructions
```

A person's briefing is their seat, then `org.md`, then their person file, then any expertise. Later layers win.

## License

[PolyForm Shield 1.0.0](LICENSE.md). You can use, change, and share Proxies for any purpose, including inside your company, except to build a product that competes with it. Versions published before this change keep the FSL-1.1-MIT license they shipped with.
