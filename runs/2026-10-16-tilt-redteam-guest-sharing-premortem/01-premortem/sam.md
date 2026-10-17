# Sam, Engineering Lead, Collaboration

**Verdict**: Block. As drafted, a guest's access depends on a link that anyone can forward, removing a guest doesn't end that access everywhere, and the weekly AI summary sends internal comments to outsiders, so data exposure is built into the design.

## How it failed

We shipped guest sharing on Tuesday, April 14. Fernhill Design turned it on that Thursday. Ana's team had 40 guests by the end of April and about 260 by mid-June, across 31 projects. Nobody at Fernhill could tell you that number. We had no workspace-wide guest list, so I ran the count myself with a database query when the first incident came in.

The first incident was the weekly AI summary on Monday, June 8. A Fernhill project lead had written an internal comment on a retail rebrand: "Client keeps moving the goalposts. Bill the extra rounds as discovery." The summary model rewrote that as "The team plans to bill additional revision rounds as discovery work." It went to everyone on the project, including four people at the client. The client sent a screenshot to Ana. Ana sent it to Jo. I spent that afternoon confirming that the summary job did exactly what the spec said: it read all project activity, internal comments included, and mailed it to every guest.

The second incident was worse, and it was mine to own. On July 22, Fernhill removed a freelance motion designer from a pitch project after he took a job at a competing agency. The remove action took him off the project's member list. That was all it did. His magic link was still valid for another 19 days. The link worked as a bearer token: whoever held it got in. When he clicked it, our server issued a new session and found no membership row. But the file download links he had already opened were signed URLs (web addresses that grant access on their own, with no login check) with a 7-day expiry. Last week's summary email also held a link straight into the project. He also had the notification emails from every @mention, and those contained comment text. He did not break in. He just kept using what we gave him.

The third one we found while we cleaned up the second. In March, a Fernhill account manager had shared a magic link with a client's procurement contact. That contact forwarded the invite email to a colleague, who forwarded it to an outside consultant. Our logs show three different devices on one guest identity over five weeks. The project member list showed one "Guest" name. Nobody could see that three people were behind it.

By September, Fernhill's security team had sent us a questionnaire. Rita's renewal call on September 30 turned into a review of our SOC 2 controls. SOC 2 is the security audit enterprise buyers ask for. We could not show an access review for guests, because no list of guests existed to review. We turned off guest sharing for all customers on October 2, behind the flag, and Fernhill is now running a renewal evaluation against two competitors.

## Causes

**Where**: The magic link sent to a guest who has no Tilt login.
**How it failed**: The link was valid for 30 days, could be forwarded, and worked as the only proof of identity. Possession of the link was the same as being the guest. One invite became three people. A link in an old inbox stayed live after the guest's work ended.
**Severity**: Critical. This caused unauthorized access to customer project data, and it is the root of the July incident.
**Fix**: A magic link signs in once, expires within 15 minutes, and is bound to the invited email address. After the first sign-in, the guest gets a session tied to that email, with a device record we can see and revoke. A forwarded link that has already been used shows "ask the person who invited you for access" and does not sign anyone in.

**Where**: When someone removes a guest from a project.
**How it failed**: The remove action deleted one membership row. It did not revoke open sessions. It did not invalidate unused magic links. It did not expire signed file URLs. It did not stop the next weekly summary, which had already resolved its recipient list. Notification emails already sent still held comment text. My hard line is that removing someone ends their access everywhere at once. This design ended it in one place.
**Severity**: Critical. This was the data exposure we reported to Fernhill under our contract.
**Fix**: Removal runs one server-side revoke step. The step ends all sessions for that guest on that workspace, invalidates outstanding links, and rotates or shortens file URLs to minutes. The summary and notification jobs check membership at send time, not at schedule time. Notification emails carry a link, not comment text. We add a test that removes a guest and then tries every path: board, timeline, file URL, search, notifications, API, and summary email.

**Where**: The weekly AI status summary sent to everyone on the project.
**How it failed**: The spec told the summary job to read all activity, including internal comments, and send the result to guests. The model did what it was told. No data model separated "internal" from "shared with guests," so no filter could have caught it.
**Severity**: Critical. This leaked confidential commercial information to a customer's client, and it put the account at risk.
**Fix**: Add visibility to every comment and file as a server-side field: internal or shared. Guests can only read shared items, everywhere, and the API enforces this. The summary that goes to guests is generated only from items guests can already see. Internal members get a separate summary. Theo's team gets the guest read rule as an input, not a prompt instruction.

**Where**: The guest's ability to @mention anyone in the workspace.
**How it failed**: To autocomplete an @mention, the guest's client loaded the full workspace member directory: names, emails, and roles for all 90 Fernhill staff. That list came from the same API endpoint that seat members use. One guest scraped it, and the procurement consultant's firm used it for recruiting. It also meant a guest could ping, and start notification threads with, people who had nothing to do with the project.
**Severity**: High. This was personal data about Fernhill staff exposed to outsiders, which is a GDPR problem. GDPR is the EU data protection law. Under it, staff and guests are both data subjects.
**Fix**: Guests can only mention people on the same project. The server returns that list and nothing wider. Any directory endpoint checks whether the caller is a guest before it returns anything.

**Where**: Who can invite guests, and where guests are listed.
**How it failed**: Any seat member could invite anyone, with no approval and no limit. Guests appeared only on each project's member list. Fernhill had about 260 guests across 31 projects, and no one could see them in one place. Offboarding a contractor meant someone had to remember every project that person was on. A guest who already had a Tilt login from another company was added under that company's identity, and we had no clear rule about which workspace's policies applied. When the security questionnaire asked for a quarterly access review, we had nothing to show.
**Severity**: High. This cost us a SOC 2 control and made the Fernhill renewal a competitive evaluation.
**Fix**: Build a workspace-wide guest list for owners. It shows each guest, every project they are on, who invited them, last access, and a "remove from everything" action. Give owners a setting that limits invites to admins or requires approval. Store guest membership in our own workspace table, separate from the guest's home workspace, so revoking access in one never depends on the other.

I am not blocking guests. I am blocking this version. The permission model above has to exist on the server before any guest touches a customer project. I want to walk Jo through the data model on a whiteboard before we pick a date.
