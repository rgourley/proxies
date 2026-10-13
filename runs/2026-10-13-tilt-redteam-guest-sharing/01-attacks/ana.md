# Ana, Operations Director, Fernhill Design (customer)

**Verdict**: Rework. The weekly summary will send our internal margin talk to clients, and I can't see who's in my workspace, so I can't turn this on for 90 people.

## 1. The weekly AI summary sends our internal comments to clients

**Where**: The weekly AI status summary that goes to everyone on the project, guests included.

**How it breaks**: On the Harlow Foods rebrand, my designers argue in the comments about whether we're over budget, and one writes "client keeps moving the goalposts, pad the next estimate." The summary is written from all activity, internal comments included. On Monday the Harlow marketing lead gets an email that says Fernhill is discussing padding estimates. Across 12 projects in week one that's 12 chances for it to happen, and it only has to happen once to lose a client. The tool I used before Tilt let me mark comments internal-only. This draft doesn't even have that.

**Severity**: Critical

**Fix**: Guests get a summary built only from what guests can already see. Better still, guests get no summary until the project owner turns it on for that project.

## 2. No single list of every outside person in the workspace

**Where**: The guest list, which exists only inside each project's member list.

**How it breaks**: Any of my 90 people can invite anyone, with no approval. By Friday there are 30 client reviewers spread over 12 projects. A client contact leaves Harlow Foods and goes to a competitor. To find which projects she's on, I'd have to open all 12 member lists one at a time, and next quarter that's 50 projects. I can't answer my own clients' security questionnaires either, because I can't produce a list of who has access. This is one of my hard lines.

**Severity**: Critical

**Fix**: Add a workspace-wide guest list for admins: name, email, the projects each guest is on, who invited them, last active, and one button that removes a person from every project at once.

## 3. A forwarded magic link puts strangers into the project for 30 days

**Where**: The magic link the guest gets by email, valid for 30 days and forwardable.

**How it breaks**: The Harlow brand manager forwards the review email to her agency of record and her boss "so they can take a look." Now three people I never invited are on the board, can upload files, and can @mention my staff, and nothing says who they are or that they came in on someone else's link. Clients forward everything. I want them to skip the password. I don't want the link to work as a master key.

**Severity**: High

**Fix**: Tie the link to the invited email address. When someone else opens it, they enter their own email and get their own link, and that new guest shows up in the admin list with "invited via" next to the name. Cut validity to 7 days, with a one-click "send me a new link."

## 4. Guests can @mention anyone in our 90-person workspace

**Where**: The step where the guest comments, uploads files, and @mentions anyone in the workspace.

**How it breaks**: A Harlow reviewer types "@" and sees the whole Fernhill staff directory, including people on competing accounts. She starts @mentioning our creative director directly and skips the account lead. My people get pinged by clients they don't work with, and the client now knows who else works here. It also tells her roughly how big the team is behind every client we have.

**Severity**: Medium

**Fix**: Limit a guest's @mention list to the people on that project.

## 5. "Ask to be made a member" puts a seat request in front of the owner with no context

**Where**: The prompt that appears when a guest clicks Edit on a task, followed by the seat request to the workspace owner.

**How it breaks**: Thirty curious clients each click Edit once to see what happens. Our owner gets 30 requests to add a paid seat at $12 a month, with no mention of which project or who invited them, and the client is told to "ask the owner," which means me. That's 30 confusing emails, and some clients now think they've been locked out of something. A client should never become a paid Fernhill seat. Tool spend per project is one of the numbers I'm measured on.

**Severity**: Medium

**Fix**: Guests don't see an Edit button. If a guest needs to change something, they leave a comment that tags the person who invited them. Seat requests only come from people with a Fernhill email.
