# Sam, Engineering Lead, Collaboration

**Verdict**: Block. A forwardable 30-day link plus an AI summary built from internal comments means Fernhill's private notes reach people nobody invited, and removal can't stop it.

## 1. The magic link is a bearer token anyone can use for a month

**Where**: The step where a guest without a Tilt login gets a magic link and no password.

**How it breaks**: Fernhill invites the marketing lead at one of its clients to review a rebrand. She forwards the invite email to her CEO, her procurement contact, and a freelance copywriter who is also pitching a rival agency. All four open the same link. To the server they are one guest. The server has no way to tell who approved the deliverable, who uploaded a file, or who read the board. Multiply that by 30 invites across 12 projects in week one and Fernhill has an unknown number of people inside its projects. Tilt can't produce an access log that a SOC 2 auditor (System and Organization Controls, the security audit enterprise buyers ask for) will accept. GDPR (the EU data protection law) is a problem too: we hold activity data for people we never identified.

**Severity**: Critical.

**Fix**: Bind the link to the invited email. One click sends a one-time code to that address, and the code creates a session for that person only. The link itself expires after first use or 7 days, whichever comes first. A forwarded link then shows "ask Fernhill to invite you" and grants nothing.

## 2. The weekly AI summary sends internal comments to the client

**Where**: The step where the weekly AI status summary goes to everyone on the project, guests included, written from all project activity.

**How it breaks**: On the rebrand project, two Fernhill designers comment internally: "Client's budget is tight, we're cutting the third concept and not telling them," and "their CMO is impossible, pad the timeline two weeks." On Friday the summary model reads every comment and writes "The team reduced scope to two concepts and added a two-week buffer due to stakeholder friction." It emails that to the client. Nothing in the design marks a comment as internal, so no permission check exists that the summary job could respect. The summary is generated once for the whole project, so it can't be filtered per reader. This happens on all 12 projects in the same Friday batch. Ana hears about it from her clients before she hears it from us.

**Severity**: Critical.

**Fix**: Generate the summary per audience. The guest version reads only content that the guest's own permissions on the server can already read. Run it through the same read check as the board, not a separate filter inside the AI job. Until internal comments exist as a real visibility flag, send the summary to seat members only.

## 3. Removing a guest does not end their access everywhere

**Where**: The rule that removing a guest takes them off the project, with no workspace-wide list of guests.

**How it breaks**: One client reviewer is on 4 of Fernhill's 12 projects. Fernhill loses the account and wants him out today. There is no single place to see him, so Ana has to open every project's member list to find him. She misses one. Even on the projects she does catch, these keep working:

- the 30-day magic link and any session cookie it already created
- notification emails that deep-link into tasks
- file download links he already copied
- copies of the link he forwarded (see breakage 1)

My hard line is that removal ends access everywhere at once. This design removes a row from one project's member table.

**Severity**: Critical.

**Fix**: Make the guest a workspace-level identity with project grants. Add a workspace guest list with "Remove from workspace." Removal revokes all sessions and links, and every request checks the grant on the server. File and notification links go through an authorization check on every fetch, not signed URLs that outlive the grant.

## 4. Guest scope is defined for the board, not for search, mentions, notifications, or the API

**Where**: The step where the guest sees the board and timeline, then comments, uploads files, and @mentions anyone in the workspace.

**How it breaks**: To @mention anyone in the workspace, the guest's browser has to fetch the workspace member directory. That directory gives a Fernhill client the names and emails of all 90 Fernhill staff. Depending on how we build it, it also lists the other 29 guests, who work for Fernhill's other clients, some of them competitors. I try the obvious paths next:

- workspace search with the guest's session
- the task API with a task ID from a different project
- the notification feed after a staff member @mentions the guest in a thread that also references another project

The design says nothing about any of these, so I assume each one returns data until someone proves it doesn't. The guest who arrived through an existing Tilt login is worse. That person already has API tokens from their own workspace, and nothing here says those tokens are scoped away from Fernhill.

**Severity**: High.

**Fix**: Add one server-side check, "can this principal read this project," and run it on every endpoint: search, API, notifications, file fetch, and mention autocomplete. Guests @mention only people on the same project, and autocomplete returns names only. Ship with a test that logs in as a guest and calls every read endpoint against a project the guest is not on, and expects a 404 from each.
