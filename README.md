<img width="1456" height="816" alt="image-1792012644362" src="https://github.com/user-attachments/assets/6fc0e66d-b9ad-4642-a903-7b790b196aa8" />

# Proxies: simulated stakeholder reviews in Claude Code

A simulated room of stakeholders you run an idea, prototype, or design past before the real meeting. Each proxy has a card: role, incentives, hard lines, blind spots, voice. Give them a flow, spec, or prototype, and each one tells you where it breaks for them, in plain business English. A proxy stands in for a role, not a real individual.

<img width="1054" height="757" alt="Screenshot 2026-10-14 at 2 33 48 PM" src="https://github.com/user-attachments/assets/9957a5a7-6f9f-4307-8e15-f7922365131c" />

## Why not five personas in one prompt

- Each proxy runs as a separate agent that sees only its own card, so they don't blur into one agreeable voice.
- Proxies are saved, reused, and tuned against real feedback from people in those roles.
- They read your actual spec and decision docs before they review.
- Every run ends with a verdict per proxy (Block, Rework, Ship), ranked findings, and the fixes that clear the most blocks, on one results page.

## Setup

You need Claude Code and Node.js 22.18 or later. Nothing else to install: Proxies has no dependencies, and the skill runs its own scripts.

In Claude Code:

```
/plugin marketplace add rgourley/proxies
/plugin install proxies@proxies
```

Then open Claude Code in the folder where you want your reviews to live, and run `/proxies init`. It creates `orgs/`, `knowledge/`, and `runs/` there, and offers to copy in the sample orgs. Your orgs and runs stay in that folder, so each project keeps its own reviews, and the plugin itself never holds your data.

To work on Proxies itself, clone the repo and load it in place with `claude --plugin-dir .`.

### Codex

Clone the repo, then run the installer that ships in it. The installer links the skill into `~/.agents/skills/` and writes the `proxy` and `describer` agents to `~/.codex/agents/`, from the same files Claude Code uses. It downloads nothing.

```bash
git clone https://github.com/rgourley/proxies.git
```

Then, from inside the `proxies` folder, run `node scripts/install-codex.ts`. Run it again after you pull. Then use `$proxies` in Codex from any folder, the same way as `/proxies` in Claude Code.

<img width="1050" height="608" alt="Screenshot 2026-10-14 at 2 35 10 PM" src="https://github.com/user-attachments/assets/549a67b7-7cc8-444d-b758-d6a829ac4761" />

## Commands

Not sure which one you need? Run `/proxies` on its own, or describe what you want. It asks a few questions and suggests one.

| Command | What it does |
|---|---|
| `redteam <file> "<scenario>"` | Everyone tries to break it. `--premortem`: they imagine it already failed and say why |
| `meeting <file> "<question>"` | Blind round, rebuttals, then the decision owner calls it, with dissent recorded |
| `workshop "<question>"` | Each proxy proposes ideas, then builds on and challenges the others'. No verdicts |
| `prep <file>` | Each proxy's top questions for the real meeting |
| `followup <run> <file>` | Check whether a revision answered their objections |
| `compare <a> <b>` | Each proxy picks a version |
| `ask <handle> "<question>"`, `talk <handle>` | Talk to one proxy |
| `init` | Set up the current folder for Proxies, and copy in sample orgs |
| `use <org>`, `org new`, `new`, `clone`, `calibrate` | Pick, build, and tune orgs and proxies (see below) |
| `knowledge new`, `add`, `refresh` | Build a knowledge collection (see below) |
| `export <org>`, `import <file>`, `pages` | Share an org as one JSON file, and publish results |

Every command starts with `/proxies`. Flags: `--org <id>` uses another org. `--use <id>` or `--with a,b,c` picks the attendees. `--dissenter <handle>` makes one proxy hold their position. `--no-decision` ends a meeting after the rebuttals. `--wordy` drops the word targets. `--images` gives proxies screenshots instead of a text description. `--noui` shows results in chat instead of the page.

## Orgs and groups

An org is the set of proxies who review together. It comes in two types:

- **Company** (`type: company`): a business with rules, culture, and decision rights. Proxies are stakeholders: an approver, a veto holder, a decision owner. Use it to rehearse how a real organization decides.
- **Group** (`type: group`): an ad hoc set of proxies with a purpose, and no business or decision rights. Use it for a design critique, a panel of users, or a room of specialists.

Six fictional orgs ship with the repo:

| Org | Type | Who is in it | Sample runs |
|---|---|---|---|
| `tilt` | Company | A software company: product, engineering, sales, support, AI, and a customer | Red team and premortem of a guest-sharing flow |
| `brightpath` | Company | A 14-site clinic network, with privacy and accessibility | None |
| `northpine` | Company | A game studio running one live game | None |
| `design-crit` | Group | A cross-discipline critique: product, content, accessibility, front end, and a first-time user | Red team of a sign-up flow |
| `user-panel` | Group | Five small business users who differ in device, time, and language | Red team of the same sign-up flow |
| `options-panel` | Group | A new trader, a veteran trader, an educator, and a compliance officer | Workshop on how a new trader learns options |

`design-crit` and `user-panel` reviewed the same sign-up flow, so you can compare what experts catch with where users quit. See any org's runs with `npm run pages -- --org <org>`, then open `runs.<org>.html`.

## Make your own

Describe the company or group, and Claude drafts it. Anything it guessed is marked "(assumed)", and you see the draft before it saves.

```
/proxies org new acme "Mid-size insurer buying a claims tool. IT and compliance can veto vendors."
/proxies org new crit --group "Design critique for our checkout"
/proxies new dana compliance
```

`new` takes a handle and a seat, the role template in `seats/` that the proxy starts from. Add your own seats as markdown files. `clone dana --to acme` adapts a proxy from another org. Each proxy has a decision level: `owner` decides, `veto` can block, `approve` must sign off, `consult` gives input, `inform` is kept in the loop. In a group, everyone is `consult` unless you say otherwise. Everything is plain markdown, so you can also copy `orgs/tilt/` or `orgs/design-crit/` and edit by hand.

When you get real feedback from someone in a proxy's role, such as a customer interview, run `/proxies calibrate dana "what they said"`. Claude compares it with the proxy's responses, proposes edits, and logs the change.

Each proxy gets a generated avatar, chosen by its pronouns and fixed per proxy. Set it with `avatar_hair`, `avatar_top`, `avatar_facial_hair`, and `avatar_glasses` in the proxy file, or reroll it with `avatar_seed`.

## Knowledge

Knowledge is what proxies know. The artifact is what they judge. The two never mix: knowledge lives in `knowledge/<id>/`, and the artifact is copied into each run.

A collection has an `index.md` with its key points and a list of sources marked **Required** or **When needed**, and a `sources/` folder with a saved copy of each document, its link, and its last-edited date.

```
/proxies knowledge new cardiology-trials "Phase 3 trials for the drugs in our intake flow"
/proxies knowledge add cardiology-trials https://example.org/trial-a.pdf ~/research/trial-b.md
```

Use a collection in one of two ways:

- **Expertise:** `knows: [cardiology-trials]` on a proxy, or in `org.md` for everyone. They apply it and cite it, but don't review it. Proxies without it don't get it, so the cardiologist and the compliance officer in one run know different things.
- **Context:** `context: cardiology-trials` in a run's `meta.md`. Every proxy in the run reads it first. Use this for the spec of the project under review.

`/proxies knowledge refresh <id>` pulls every source again from its link.

## Results and sharing

The results page opens after every run. Each run shows who blocks, the ranked findings, what to fix first, and every proxy's full response. Click any name for that proxy's card. `/proxies pages` publishes each org's page as a private Claude artifact that you share from its Share menu.

To share an org, `/proxies export <org>` writes one JSON file with its proxies, calibration logs, and seats. The page's **Export** button copies the same JSON. `/proxies import <file>`, or `import` with no file to read the clipboard on macOS, never overwrites an org: add `--as <new-id>` for a second copy.

If your project folder is a git repository, `/proxies init` asks whether to commit your Proxies data. To keep one client's work out of a repo you do commit, list it in `.git/info/exclude`, which stays on your machine:

```
orgs/acme/
knowledge/acme-*/
runs/*acme*/
```

## How it works

[ONTOLOGY.md](ONTOLOGY.md) defines every term. The plugin folder holds `seats/`, `formats/`, `scripts/`, `agents/`, `skills/`, and the sample `orgs/` and `runs/`. Your project folder holds your own `orgs/`, `knowledge/`, `runs/`, and any `seats/` you add, which override the plugin's.

```
seats/                  role templates that every org reuses
orgs/<org>/             org.md, proxies/ (one file per proxy), calibration/
knowledge/<id>/         index.md and sources/
formats/                each review procedure, with a Facilitator section
runs/<run>/             meta.md, input/ (the artifact), prompts/, one folder per round, summary.md
scripts/                brief.ts (prompts), check.ts (run checks), runs.ts (results page), export and import
agents/                 proxy.md (one proxy per subagent) and describer.md (screen descriptions)
skills/proxies/         SKILL.md (every run) and manage.md (init, org, proxy, knowledge, and page commands)
.claude-plugin/         plugin.json and marketplace.json
```

A proxy's prompt layers its seat, its org, its own card, any expertise, and the round's instructions. Later layers win. `npm run check` checks every run, and the facilitator fact-checks each summary against the responses before it reports.

Runs are built to be cheap. A `describer` agent on a cheaper model writes down every word on each screenshot once, and proxies read that text instead of the images. Proxies read a collection's index and Required sources, and open the rest only when a point depends on it. A 12-proxy review of 50 screenshots dropped from about 2.6 million tokens to 0.85 million on the main model, plus 0.16 million on the cheaper one. The proxies themselves run on your session's model, because judgment is where quality matters.

## License

[PolyForm Shield 1.0.0](LICENSE.md). You can use, change, and share Proxies for any purpose, including inside your company, except to build a product that competes with it. Versions published before this change keep the FSL-1.1-MIT license they shipped with.
