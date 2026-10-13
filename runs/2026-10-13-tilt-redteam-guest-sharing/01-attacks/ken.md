# Ken, Head of Support

**Verdict**: Block. The weekly summary sends Fernhill's internal comments to their clients, and support has no way to see what a guest sees, so the first bad week turns into escalations I cannot answer.

## 1. The weekly AI summary mails internal comments to clients

**Where**: The step that sends the weekly AI status summary to everyone on the project, guests included, written from all project activity.

**How it breaks**: On Tuesday a Fernhill producer writes in a task comment, "Client keeps moving the goalposts, pad the estimate two weeks." On Friday the summary goes to all 30 client reviewers across 12 projects. One of them reads "the team noted scope concerns and extended the estimate" and forwards it to their boss. Ana's first contact is not a ticket. It is a call to Rita asking whether Tilt is safe to keep. The tickets that follow, word for word: "Why did my client get our internal notes?" "How do I recall the summary email?" "Which of my other clients got this?" I have no answer to the third one, because nothing tells me which summaries went to which guests or what they said.

**Severity**: Critical.

**Fix**: Guests get a summary built only from what a guest can already see on the board: guest-visible comments, task status, and dates. Internal comments never enter it. Keep a copy of each summary sent, with its recipients, so support can show a customer exactly what went out.

## 2. Support cannot see what a guest sees, and there is no guest list

**Where**: The rule that guests appear only in each project's member list, with no workspace-wide list of guests. Also the step where a guest views the board and timeline.

**How it breaks**: Ana loses a client account in week two and asks, "Which of my projects can someone from Northfield still open?" The answer lives in 12 separate member lists. She removes their reviewer from one project, and that person is still on three others, because removal is per project. The ticket: "I removed her and she still left a comment yesterday." When a guest writes in with "I can see the board but not the files," I have no guest view to check. My only option is to log in as the guest or the customer, and that is my one hard line. Every guest ticket becomes a screen-share, and time to resolve goes from minutes to days.

**Severity**: Critical.

**Fix**: Add one workspace-wide guest list with each guest's projects, last activity, and a "remove from all projects" action. Give support a read-only "view as this guest" mode that is logged and needs no customer login.

## 3. A forwarded 30-day magic link lets strangers into the project

**Where**: The step that sends a magic link to a guest with no Tilt login. The link is valid for 30 days and can be forwarded.

**How it breaks**: A reviewer at Fernhill's client forwards the invite to her team "so they can look." Four people now open the project under one guest identity. Their comments all show her name. She leaves the client company in week three, and her link still works until day 30. Then on day 31 the original reviewer clicks her bookmark mid-review and gets nothing. The tickets: "Who left this comment? It says Dana but Dana says it wasn't her." "My link stopped working." "How do I turn off a link I already sent?" "Your email went to our spam folder, resend it." Thirty guests in week one means the "link expired" ticket shows up weekly from now on, forever.

**Severity**: High.

**Fix**: Bind the magic link to the invited email. Opening it sends a short one-time code to that address, so a forwarded link is useless. Let a guest request a new link from the expired page without contacting anyone. Show the inviter and the owner a "resend invite" and "revoke" action.

## 4. A client clicking Edit lands on Ana's desk as a request to buy a seat

**Where**: The step where a guest clicks Edit on a task, gets "ask the owner to make you a member," and the workspace owner gets a request to add a paid seat.

**How it breaks**: Fernhill's client reviewers want to fix a typo in a task title. Thirty of them click Edit in week one. Ana gets a stream of "please add a paid seat" requests from people who are not her staff and should never be paid members. The client sees a message telling them to ask an owner they have never met, so they email their Fernhill account manager, who emails Ana, who emails us. If one owner taps approve to make the noise stop, Fernhill pays $12 a month for a client. The tickets: "Why is my client asking me to pay for Tilt?" "I got charged for a seat I didn't add." "How do I turn off these requests?" Billing refunds follow, and those take three times as long to close as a how-to ticket.

**Severity**: High.

**Fix**: Do not route guest edit clicks to the owner as a seat request. Tell the guest plainly, "Guests can comment and approve. Ask [inviter's name] to make the change," and post a notification to the inviter. Any seat purchase from this path needs the owner to confirm a price on a billing screen, never a one-tap approve.

## 5. A guest with an existing Tilt login gets added with no notice

**Where**: The step that checks whether the email already has a Tilt login and, if yes, adds the person to the project as a guest.

**How it breaks**: Some of Fernhill's clients are agencies too and already use Tilt in their own workspace. The flow adds them directly, with no invite email described. They never learn they were added, so the Fernhill producer waits two days for feedback, then writes in: "I invited my client and she says she never got anything." When she does find it, Fernhill's project sits next to her own company's projects with no clear mark that it belongs to someone else, and her @mentions offer all 90 Fernhill staff. She pings the wrong Fernhill designer about a project he is not on. The tickets: "Invite never arrived." "Whose project is this in my sidebar?" "A client mentioned me on a project I'm not part of."

**Severity**: Medium.

**Fix**: Always send an invite email, login or not, naming the inviting company and project. Show guest projects under the host company's name in the sidebar. Limit a guest's @mention list to people on that project.
