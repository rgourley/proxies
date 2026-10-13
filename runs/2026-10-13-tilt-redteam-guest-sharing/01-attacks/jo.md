# Jo, Head of Product

**Verdict**: Rework. The core path works, but in week one Fernhill's clients would read Fernhill's internal comments and Ana would get billed for seats nobody asked for. Each one costs us the account.

## 1. The weekly AI summary sends internal comments to the client

**Where**: The weekly AI status summary that goes to everyone on the project, written from all project activity.

**How it breaks**: On Fernhill's rebrand project, a designer writes an internal comment: "Client keeps moving the deadline, we're padding the estimate." Monday morning the AI summary goes to the client's marketing director, with that comment summarized into it. With 30 reviewers on 12 projects, this hits a client in the first week, not someday. Ana churns, and the story spreads through every agency Slack group we sell into.

**Severity**: Critical. This is the one that stops me shipping.

**Fix**: For v1, guests do not get the summary. Seat members still do. A guest version built only from guest-visible activity comes later, if anyone asks for it.

## 2. A client clicking Edit can put a paid seat on Fernhill's bill

**Where**: The guest clicks Edit on a task, gets the prompt to ask for membership, and the workspace owner gets a request to add a paid seat.

**How it breaks**: Client reviewers click Edit all the time. They want to fix a typo in a task title. That fires 30 people's worth of seat requests at Ana in week one. Fernhill gives one-click approval to a few of them because the client is important, and now Fernhill pays $12 a month per client reviewer. Nobody at Fernhill chose to pay for that. The seat expansion number goes up, and it's fake. Those seats churn at the first invoice review, along with some goodwill. That breaks my hard line: nothing costs a customer money by surprise.

**Severity**: High.

**Fix**: Hide Edit from guests. Cut the seat request from v1. A client is never a seat. If contractors need edit rights, that's a separate decision with the price shown before anyone approves it.

## 3. Ana can't see or remove who has access

**Where**: The magic link stays valid for 30 days and can be forwarded. There is no workspace-wide guest list. Removing a guest happens one project at a time.

**How it breaks**: A reviewer forwards the link to three colleagues, and one of them forwards it to a freelancer. Now there are people on Fernhill's projects that Fernhill never invited. A client relationship ends, and Ana has to open 12 projects to find out where that client's people are. She can't answer "who outside Fernhill can see our work?" That question shows up in every enterprise security review Rita runs, and Ken gets the tickets.

**Severity**: High.

**Fix**: Tie the magic link to the invited email so a forwarded link fails. Add one guest list for the workspace, with project access per guest and a "remove from all projects" action. Skip anything fancier.

## 4. The @mention list shows a client the whole agency

**Where**: A guest can comment, upload files, and @mention anyone in the workspace.

**How it breaks**: A client reviewer types "@" and sees all 90 Fernhill staff, plus the names of people on other clients' accounts. Then they start pinging the creative director directly and skip the account manager. Fernhill's account leads lose control of the client relationship, and that's the reason agencies buy a planning tool in the first place.

**Severity**: Medium.

**Fix**: Guests can only @mention members of the projects they are on.

## 5. We have no number that says this worked

**Where**: The whole proposal. Free, unlimited guests that any seat member can invite.

**How it breaks**: Fernhill's freelance contractors join as free guests and do real work through comments, uploads, and approvals. That's seats we would have sold. Or it's activation that pulls in new seats later. The draft doesn't say which one we expect, so we can't measure it. In eight weeks I won't know whether guest sharing grew seats or ate into them.

**Severity**: Medium.

**Fix**: Before build, write down the metric. I'd use seats added per workspace in the 60 days after the first guest invite, compared with workspaces that have no guests. Track the guest-to-seat ratio per workspace. Keep guests free and unlimited for v1, but launch behind a flag on Fernhill and a few other agencies so we read the number before rolling it out wide.
