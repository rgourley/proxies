# Marcus, Office manager at a 12-person design agency

**Verdict**: Rework. I am signing up on behalf of my boss, and this form never tells me whose account I am creating, so I could tie the agency's billing records to the wrong person.

## 1. The account screen never says whose account it is

**Where**: The create-your-account screen.

**How it breaks**: I'm setting this up for Dana, who owns the agency. The form asks for first name, last name, work email, and phone, all with no explanation. Is this the account owner, or just the first user? If I put my details in, the agency's invoicing is tied to me. If I leave, Dana has to ask support to get her own company back. If I put Dana's in, the next screens behave as if she is the one typing.

**Severity**: Critical.

**Fix**: Add one line above the fields: "This person will own the account. You can invite others, and change the owner later." Then let me add Dana as owner or invite her later from settings.

## 2. The confirmation link goes to someone else's inbox and dies in 15 minutes

**Where**: The check-your-email screen.

**How it breaks**: Say I enter Dana's email to keep the account off mine. The link goes to her inbox. She is with a client until 4pm. I text her, she sees it two hours later, and the link has expired. There is no resend button and no way to change the address, so I start over. The screen also does not show which address it sent to, so I can't even confirm I typed hers right.

**Severity**: High.

**Fix**: Show the address the link went to. Add a resend button and a "wrong email? change it" link. Make the link last at least 24 hours.

## 3. One checkbox makes me agree to marketing emails on the owner's behalf

**Where**: The terms checkbox on the create-your-account screen.

**How it breaks**: To get an account at all, I have to tick one box that agrees to the Terms, the Privacy Policy, and marketing emails. I can't sign up without it. If Dana's email is on the account, I have just signed her up for marketing she never asked for. She will ask me why her inbox is full of Ledgerly emails. I also have not read the Terms, and the box does not tell me who is bound by them, me or the agency.

**Severity**: High.

**Fix**: Split it into two checkboxes. Terms and Privacy stays required. Marketing becomes optional and unticked. Add one line saying the terms apply to the company named on the form.

## 4. Required phone number with no reason given

**Where**: The phone number field on the create-your-account screen.

**How it breaks**: Whose phone goes in, mine or Dana's? The form doesn't say why it wants a number. If it's for account recovery, it has to be the owner's. If it's for sales calls, I don't want to give Dana's out. I'll probably put the office landline. If that number is later used for a security code, nobody at the desk can receive a text, and we are locked out.

**Severity**: Medium.

**Fix**: Make phone optional. If you keep it, say what it is for under the field, for example "Used only for account recovery."

## 5. The team questions assume the person typing is the person in the role

**Where**: The tell-us-about-your-team screen.

**How it breaks**: It asks my role, team size again, industry, and a required "biggest invoicing challenge" with no skip. I'm the office manager, not the person who chases invoices. I either guess Dana's answers or write mine, and either way you personalize the product for the wrong person. It also asks for team size a second time, which makes me wonder if the first answer was saved.

**Severity**: Medium.

**Fix**: Add a skip link. Drop the repeated team size question. Make the challenge question optional.
