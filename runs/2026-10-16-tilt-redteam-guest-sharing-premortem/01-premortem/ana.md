# Ana, Operations Director, Fernhill Design (customer)

**Verdict**: Block. The draft breaks both of my hard lines: some clients still have to sign in, and I cannot see every outside person in one list.

## How it failed

We turned guest sharing on in the first week of November 2026. I wanted it badly. Before Tilt we used Basecamp, then Asana, then Monday. Every one of them made my clients create an account, and every one cost us approvals. For about three weeks, Tilt's version looked like the one that finally got it right. Most clients clicked a link, saw the board, and approved. No password.

The first crack showed in late November. Our client at Halvard Foods already had a Tilt login from a job with another agency. Tilt added her as a guest under that login instead of sending her a link. She did not remember her password. She emailed our account lead, Priya, twice. Then she approved the packaging round by email, outside Tilt, four days late. Nobody at Tilt had told us that a client with an existing login gets a different path. From my seat, that is a password wall.

The real damage came on January 11, 2027. The weekly AI status summary for the Halvard project went to everyone on the project, client included. It summarized our internal comments. One line said the team "flagged that the client's feedback is delaying the timeline and suggested holding round three until the invoice clears." Halvard's marketing director read that on a Monday morning. Our managing partner spent the week on the phone. We kept the account, but we wrote off the round-three fee to keep it.

After that, I tried to find out which outside people could see what. I could not. There is no workspace-wide list of guests. Each of our 40 or so active projects has its own member list. I opened every one by hand. I found 312 guests. 61 of them belonged to clients whose work had ended months before. Eleven were people none of us recognized. Those were forwarded magic links. One was a freelancer who now works for a competing studio.

We also had requests for paid seats that I did not expect. Clients clicked Edit on a task, got the prompt to ask for membership, and our partners got a request to add a seat. Two partners approved them to be polite. That is $24 a month for people who should never have had a seat, and I only found it on the invoice.

In February I turned guest sharing off for the whole workspace. We went back to sending PDFs by email and collecting approvals in replies. By April 2027, six months after launch, Fernhill used guest sharing on zero projects. I told Jo on our quarterly call that I could not recommend it to the other agencies I talk to.

## Causes

**1. The weekly AI summary sent internal comments to clients**

- **Where**: When Tilt sends the weekly AI status summary to everyone on the project.
- **How it failed**: The summary drew on all project activity, including comments my team wrote for each other. It then went to guests. Our team's frank notes about a client reached that client in a polished paragraph.
- **Severity**: Critical. It cost us a fee and nearly cost us a client. It would be the same for any agency.
- **Fix**: Guests never get a summary built from internal comments. Either build the guest summary only from content guests can already see, or do not send the summary to guests at all in this version. Give us a way to mark a comment as internal, and keep internal the default for seat members.

**2. No single list of outside people**

- **Where**: The guest tag in each project's member list, with no workspace-wide view.
- **How it failed**: I could not see who had access across 40 projects. Old clients kept access for months. I could not answer my managing partner when he asked who could see the Halvard files.
- **Severity**: Critical. This is one of my hard lines.
- **Fix**: One list of every guest in the workspace. It shows which projects each guest is on, who invited them, and when they last opened anything. I need to remove a guest from every project in one action. Expire guest access when a project is archived.

**3. Magic links that anyone can forward**

- **Where**: When a guest gets a magic link that stays valid for 30 days and can be forwarded.
- **How it failed**: Clients forwarded links to colleagues and outside vendors. Whoever held the link got in, and whoever got in could approve a deliverable. I had approvals I could not tie to a named person, and eleven guests I could not identify.
- **Severity**: High.
- **Fix**: Tie each link to the email it was sent to. If a forwarded link is opened, the new person gets their own link sent to their own inbox, still with no password. Record the actual person on every approval. Do not shorten the experience into a password. Make the link personal, not harder.

**4. Clients with an existing Tilt login hit a sign-in wall**

- **Where**: The check for whether the email already has a Tilt login.
- **How it failed**: Clients who had used Tilt with another agency were added under their old login. They had to sign in with a password they had forgotten. Approvals slipped.
- **Severity**: High. It breaks my first hard line for a growing share of clients, because Tilt sells to agencies and clients work with more than one.
- **Fix**: Every guest gets the same no-password link, whether or not they have a Tilt login. Let them connect it to their login later if they want to.

**5. Any team member can invite, and clients can trigger seat requests**

- **Where**: When any seat member invites a guest with no approval, and when a guest clicks Edit and the workspace owner gets a request for a paid seat.
- **How it failed**: Our juniors invited contractors and client staff freely, which grew the unknown guest count. Clients clicked Edit by habit and partners approved seat requests without asking me. Tool spend per project went up with no one deciding it should. Guests could also @mention anyone in the workspace, so clients pinged our partners and junior designers directly and skipped the account lead.
- **Severity**: Medium. Each one alone is small. Together they made the feature feel out of my control.
- **Fix**: Let the workspace admin choose who may invite guests. Send seat requests from guests to the admin, not to any owner, and show the cost before approval. Limit guest @mentions to people on that project, and let the admin turn mentions off.
