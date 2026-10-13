# Rita, VP Sales

**Verdict**: Rework. As written, guest sharing hands Fernhill a free seat that does most of a paid seat's job, and it leaks internal comments to clients, so it hurts both my renewal and every security review in my pipeline.

## 1. Guests can do most of a paid seat's job, so Fernhill stops buying seats

**Where**: The step where a guest can comment, upload files, and @mention anyone in the workspace, under the rule that guests are free and unlimited.

**How it breaks**: Ana's 30 client reviewers are fine. The problem is the people who come after them. Fernhill pays for freelance illustrators, copywriters, and a couple of offshore production contractors on seats today. Every one of them mostly uploads files and comments. Week one Ana invites clients. By week three her ops lead notices contractors can do the same thing as guests and moves eight of them off seats. At renewal she asks me to drop from 90 to 75 seats, and she has a point, because our own feature told her to. That is roughly $2,200 a year gone from one account, and Fernhill is the reference account I show to every agency over 50 people. The same thing happens at Brightwell and Oakmere the quarter after.

**Severity**: Critical. Seat expansion is half of what I am measured on, and this turns it negative in our best accounts.

**Fix**: Draw the free line at reviewing, not working. A guest can view, comment, and approve. Uploading files and @mentioning outside the guest's own project need a seat. Say that line in one sentence on the pricing page so I can say it on a call.

## 2. The weekly AI summary sends internal comments to the client

**Where**: The step where the weekly AI status summary goes to everyone on the project, guests included, and the rule that the summary is written from all activity, including internal comments.

**How it breaks**: Fernhill's account lead writes in an internal comment, "Client keeps moving the deadline, pad the hours on phase 2." On Friday the summary goes to the client's brand director: "Team flagged schedule risk from repeated client deadline changes and adjusted phase 2 hours." Ana loses the client. Then I lose Ana. Then the story goes around the agency owners' Slack groups, and "Tilt's AI emails your clients what you say about them" becomes the first objection in every deal I run for a year.

**Severity**: Critical. One incident is enough to kill a renewal and poison the pipeline.

**Fix**: Guests get a separate summary built only from activity a guest can already see. Internal comments never feed a summary that a guest receives. Until that is built, guests do not get the summary.

## 3. Nobody can answer "who outside your company can see our project"

**Where**: The rules that any seat member can invite a guest with no approval step, that a magic link lasts 30 days and can be forwarded, and that there is no workspace-wide list of guests.

**How it breaks**: By Friday of week one Fernhill has 30 guests across 12 projects, invited by maybe 15 different staff, and nobody has one list. One client reviewer forwards the link to their procurement team, who forward it on. Now people Fernhill never invited are in the project, and Fernhill cannot see them. In my pipeline, Halden Partners, a 180-seat consultancy, is in a security review right now. Their questionnaire asks how we control and review external access for SOC 2 (the security audit standard enterprise buyers require). The honest answer today is "we can't list it, links can be forwarded, and anyone can invite." That deal stalls for a quarter. Their clients are in the EU, so they will also ask how a guest's data gets deleted under GDPR (the EU data protection law), and "their comments and files stay" is the wrong answer.

**Severity**: Critical. This blocks enterprise deals, which are where my new annual revenue comes from.

**Fix**: Tie the magic link to the invited email so a forwarded link does not work. Add one workspace-wide guest list the owner can see and export, with who invited each guest and when. Give the owner a setting to require approval for guest invites. Add a way to delete a removed guest's personal data on request.

## 4. The "make me a member" request sends Ana a bill for her own clients

**Where**: The step where a guest clicks Edit on a task, gets the prompt to ask the owner for membership, and the workspace owner gets a request to add a paid seat.

**How it breaks**: Client reviewers click Edit because they want to fix a typo in a task. With 30 of them, Ana gets a steady stream of "add a paid seat" requests for people who work at her clients and will never be her staff. Every one feels like Tilt asking her to pay for her customer. My account manager hears about it on the next call as "you keep trying to charge me for my clients." I like a seat prompt as much as anyone, but this one points at the wrong person and the wrong buyer. It spends goodwill and converts nobody.

**Severity**: High. It damages the price conversation with our largest customer and produces no seats.

**Fix**: Send the edit request to the person who invited the guest, as a suggested change they can accept. Show the paid seat prompt only when the guest's email is on the workspace's own domain or the inviter marks them as a contractor.

## 5. "Free and unlimited" in version one sets a price we can never raise

**Where**: The rule that guests are free and unlimited.

**How it breaks**: Once Fernhill has 30 free guests, any later limit is a price increase on something they already have, and every rep has to defend it. Ana will quote "free and unlimited" back to me word for word. We also have no count of guests anywhere, so when product and I argue about a guest tier next planning cycle, neither of us has numbers.

**Severity**: Medium. It does not break anything in week one, but it closes the pricing options we will want by spring.

**Fix**: Launch with a stated allowance, for example three guests per paid seat, which covers Fernhill's 30 reviewers with room to spare. Count guests per workspace from day one and show the count to the owner and to us.
