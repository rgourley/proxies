## Who blocks, and why

Three of six would stop it. The other three want changes first.

- **Sam** (veto holder) blocks because a forwardable 30-day link and a summary built from internal comments put Fernhill's private notes in front of people nobody invited, and removing a guest doesn't stop it.
- **Ken** (approver) blocks because the weekly summary sends internal comments to clients, and support can't see what a guest sees, so the first bad week becomes escalations he can't answer.
- **Theo** blocks because the AI summary repeats things a guest isn't allowed to see. That breaks the one rule he holds for every AI feature.

## Findings, ranked

| # | Finding | Severity | Raised by |
|---|---|---|---|
| 1 | The weekly AI summary is written from every comment, including internal ones, and goes to guests. Fernhill's margin talk lands in a client's inbox | Critical | All 6 |
| 2 | No single list of every outside person in the workspace, so nobody can answer "who outside your company can see this project" | Critical | Ana, Jo, Ken, Rita |
| 3 | The magic link lasts 30 days and can be forwarded. Anyone holding it gets in | Critical | Sam, Ana, Ken, Theo |
| 4 | Removing a guest doesn't end their access everywhere. Forwarded links and the summary keep reaching them | Critical | Sam, Theo |
| 5 | A client who clicks Edit sends Ana a request to buy a seat for her own client, with no context | High | Jo, Ana, Ken, Rita |
| 6 | Guests can do most of a paid seat's job, free and unlimited, which cuts seat growth in the best accounts | Critical | Rita |
| 7 | Guests can @mention anyone, which shows a client the whole 90-person agency | Medium | Ana, Jo |
| 8 | Guest limits are defined for the board only, not for search, notifications, mentions, or the API | High | Sam |
| 9 | Support can't see what a guest sees | Critical | Ken |
| 10 | Guest uploads and comments go straight into the AI's input | High | Theo |
| 11 | A guest who already has a Tilt login is added with no notice | Medium | Ken |
| 12 | There's no number that says the feature worked | Medium | Jo |

## Fixes that clear the most

1. **Write the guest summary from guest-visible activity only**, or leave guests off the summary until it can be. (All 6)
2. **Add a workspace-wide guest list** with who invited each guest, when, and what they can see, and a remove button. (Ana, Jo, Ken, Rita)
3. **Tie magic links to the invited email**, shorten their life, and end every session and summary on removal. (Sam, Ana, Ken, Theo)
4. **Replace "ask to be a member"** with a message to the person who invited them. Make seat upgrades the owner's choice, not the client's. (Jo, Ana, Ken, Rita)
5. **Let support view as a guest**, read-only. (Ken)
