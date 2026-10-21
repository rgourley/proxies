# Proxies

Every markdown file in this repo uses clear, professional business English. That includes the README, the skill, the formats, the seats, the orgs, and the proxies. The rules are in the "Plain business English" section of `skills/proxies/SKILL.md`.

`ONTOLOGY.md` defines every term in this repo: org, proxy, seat, knowledge, artifact, format, run, round, response, summary, and the rest. Use those terms in files, code, and chat. Do not use synonyms. Add a new term to `ONTOLOGY.md` before you use it.

This repo is a Claude Code plugin. Load it in place with `claude --plugin-dir .`. The plugin's skill and agents live in `skills/` and `agents/`, not in `.claude/`. Scripts treat the plugin folder and the user's project folder as separate roots: see the comment at the top of `scripts/lib.ts`.
