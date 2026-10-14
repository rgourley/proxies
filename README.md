# Proxies: simulated stakeholder reviews in Claude Code

A simulated room of stakeholders you run an idea, prototype, or design concept past before the real meeting. Each person has a card: role, incentives, hard lines, blind spots, voice. You give them a flow, spec, or prototype, and each one tells you where it breaks for them.

Proxies are simulations. They show the concerns a role would likely raise. They do not predict what a real person says.

<img width="1113" height="842" alt="Screenshot 2026-10-13 at 1 16 44 PM" src="https://github.com/user-attachments/assets/604ad6ea-848c-429b-8b1e-d323037466bf" />

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

Claude Code loads the `/proxies` skill and the persona agent from `.claude/` when it starts in this folder. Start a new session after you clone or pull, so it picks up changes to either. Then run `/proxies use tilt` to check that it works.

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
| `/proxies org new <id> "<brief>"` | Create an org |
| `/proxies new <handle> <seat>` | Add a person to the active org |
| `/proxies clone <handle> --to <org>` | Copy a person into another org and adapt them |
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

Git does not keep a client org out of the repo by default. List client orgs, briefs, and runs in `.git/info/exclude`. That file stays on your machine and is never pushed:

```
orgs/acme/
briefs/acme/
runs/*acme*/
```

## Layout

```
seats/                  role templates that every org reuses
orgs/<org>/org.md       company context: regulators, culture, decision rights, vocabulary
orgs/<org>/people/      one file per person; frontmatter feeds the card
orgs/<org>/calibration/ one log per person: real quotes, misses, and the edits they caused
formats/                rules for each command: meeting, redteam, prep, followup, compare, ask/talk, calibrate
briefs/<project>/       shared project context: brief.md plus the real source docs every proxy reads
runs/                   one folder per run, with every proxy's output
.claude/agents/         the persona runner (one person per subagent)
.claude/skills/proxies/ the orchestrator
```

A person file names its `seat`. The runner gets the seat file, then `org.md`, then the person file.

## License

[FSL-1.1-MIT](LICENSE.md), the Functional Source License. You can use, modify, and share Proxies for any purpose, including inside your company, except to sell a product or service that competes with it. Each version becomes MIT two years after its release.
