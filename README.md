# Proxies: simulated stakeholder reviews in Claude Code

A simulated room of stakeholders you run an idea, protoype or design concept past before the real meeting. Each person has a card: role, incentives, hard lines, blind spots, voice. You give them a flow, spec, or prototype, and each one tells you where it breaks for them.

Proxies are simulations. They show the concerns a role would likely raise. They do not predict what a real person says.

<img width="1113" height="842" alt="Screenshot 2026-10-13 at 1 16 44 PM" src="https://github.com/user-attachments/assets/604ad6ea-848c-429b-8b1e-d323037466bf" />

## Why not just ask for five personas in one prompt

- Each person runs as a separate agent that sees only their own card, so they don't blur into one agreeable voice.
- The people are saved and reused, and you can correct them against what the real person said.
- They review against the real spec and decision docs, not a stale draft.
- Formats force an outcome: blind positions, then rebuttals, then a decision, with the dissent recorded.
- Every run lands on one results page: who blocks, what's critical, what fixes it. See [Using the results page](#using-the-results-page).

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
| `--noui` | Show the results in chat and do not open the page |
| `--local` | Build and open the page on your machine, but do not republish it |

After a run, the results page opens by default. Chat shows only the verdict and the run folder.

All feedback is in plain business English.

## Making your own org and people

Describe the company in a sentence or two, and Claude drafts the org for you:

```
/proxies org new acme "Mid-size insurer, 4,000 staff, buying a claims tool. Regulated by state insurance boards. IT and compliance can veto vendors."
```

Claude writes `orgs/acme/org.md`: the business, rules, culture, who decides what, and the company's vocabulary. Anything it guessed rather than took from your description is marked "(assumed)". You see the draft before it saves. Then it offers to add people.

Add one person at a time. Give a short handle and a seat, which is the role template they start from:

```
/proxies use acme
/proxies new dana compliance
```

Claude asks for the name and title, drafts the rest from the seat and the org, and shows you before it saves. The seats are `accessibility`, `ai-enablement`, `business-lead`, `client-experience`, `compliance`, `engineering`, `exec-sponsor`, `finance`, `market-data`, `practitioner`, `product`, and `risk`. Add your own to `seats/` as markdown files.

To reuse someone you already built, `/proxies clone dana --to acme` copies the person and rewrites their title, goals, and hard lines for the new company.

Everything is plain markdown, so you can also write or edit the files by hand. Copy `orgs/tilt/` as a starting point. Each person needs a `decision` level, which sets their weight in a meeting: `owner` decides, `veto` can block, `approve` must sign off, `consult` gives input, and `inform` is kept in the loop.

The people get better when you tune them against the real thing. After a run, if the real Dana would have said something different, run `/proxies calibrate dana "what they actually said"`. Claude proposes edits to their file and logs the change.

## Using the results page

Every run lands on one page. You read and share results there, not in markdown files.

Build it and open it:

```bash
npm run pages
open runs.html
```

To read a run:

1. Pick a run from the list in the right sidebar. The newest run is at the top. Each run has its own link, so you can send someone straight to it.
2. Check the avatars under the title. The dot on each one is that person's verdict: red is Block, amber is Rework, green is Ship.
3. Hover **Reviewed** to see what they reviewed. Hover **Context** to see the docs every person read first.
4. If the run reviewed screens, open **Screens they reviewed** and click any thumbnail to see it full size.
5. Read the summary: who blocks and why, the ranked findings with severity tags and who raised each one, and the fixes that clear the most blocks.
6. Scroll down for each person's full response, blocks first.

To look at the people:

- Click any name or avatar to open that person's card: role, decision rights, hard lines, blind spots, and voice.
- Switch the sidebar from **Runs** to **People** to browse a whole org. Use the org picker to change orgs, and **About** to read the org's background.
- Each card has a **Copy** button for its `/proxies ask <person>` command, so you can paste it into Claude Code and question that person directly.
- Collapse the sidebar when you want the full width for reading.

To build a page with only one org, for a demo or a screenshot, run `npm run pages -- --org tilt`. It writes `runs.tilt.html`.

To share it, run `/proxies pages`. It rebuilds the page and republishes it as a private Claude artifact. Then use the artifact's Share menu to give your team access.

## Sharing an org

An org exports to one JSON file with its people, their calibration logs, and the seats they use. In Claude Code, run `/proxies export tilt` and `/proxies import tilt.proxies.json`. From a terminal:

```bash
npm run export-org -- tilt
```

That writes `tilt.proxies.json`. Whoever receives it imports it into their own copy of the repo:

```bash
npm run import-org -- tilt.proxies.json
```

On the results page, open **People**, pick the org, and click **Export** to copy the same JSON. Then run `/proxies import` in Claude Code and it reads the clipboard. Clipboard import uses `pbpaste`, so it works on macOS. Elsewhere, paste the JSON into a file and run `/proxies import <file>`. The page only exports, because it can't write into anyone's repo.

The import refuses to overwrite an org that already exists. Add `--as <new-id>` to import it under another name. Seats the other repo lacks are added. If a seat differs from their copy, the import stops and names it.

## Sample orgs

Two fictional orgs ship with the repo so you can try it right away. `tilt` is a SaaS company that makes a project planning tool. `brightpath` is a 14-site clinic network. They hold people only. You bring the thing to review:

```
/proxies use tilt
/proxies redteam path/to/your-flow.mmd "an agency invites 30 client reviewers"
```

Client orgs, briefs, and runs stay local. `.gitignore` lists them.

## Layout

```
seats/                  role templates that every org reuses
orgs/<org>/org.md       company context: regulators, culture, decision rights, vocabulary
orgs/<org>/people/      one file per person; frontmatter feeds the card
orgs/<org>/calibration/ one log per person: real quotes, misses, and the edits they caused
formats/                rules for meeting, redteam, ask/talk
briefs/<project>/       shared project context: brief.md plus the real source docs every proxy reads
runs/                   one folder per run, with every proxy's output
.claude/agents/         the persona runner (one person per subagent)
.claude/skills/proxies/ the orchestrator
```

A person file names its `seat`. The runner gets the seat file, then `org.md`, then the person file. 

## Isolation

- Each proxy runs in its own subagent. The main thread facilitates and never speaks as a proxy.
- The runner receives only its own seat, org, and person text, plus the artifact.
- The first round is blind. Proxies see each other only through attributed transcripts.

## License

[FSL-1.1-MIT](LICENSE.md), the Functional Source License. You can use, modify, and share Proxies for any purpose, including inside your company, except to sell a product or service that competes with it. Each version becomes MIT two years after its release.
