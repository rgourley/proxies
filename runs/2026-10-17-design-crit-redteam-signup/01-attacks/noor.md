# Noor, Senior product designer

**Verdict**: Rework. The flow asks a busy owner for too much on a phone, then drops them on a dashboard with no visible next step, so few of them will reach a first invoice in five minutes.

Before what's wrong, what each screen is for. The account screen should get someone in. The email screen should confirm they own the address. The team screen should be optional. The dashboard should get them to their first invoice. Most of the screens don't do the one job they have.

## 1. The dashboard hides the one thing it exists for

**Where**: The first dashboard, right after sign-up.

**How it breaks**: Maria runs a four-person landscaping business. She makes it through sign-up on her phone with a minute left before her next call. She lands on an empty table with five column headers, no message, and no button. "New invoice" sits inside the overflow menu at the top right, and on a phone that menu is a small icon she has no reason to tap. She closes the tab, thinking she'll come back later. She doesn't. This breaks my first hard line: every screen has one primary action, and it is obvious.

**Severity**: Critical.

**Fix**: Replace the empty table with a short empty state. One line: "Create your first invoice." One full-width primary button under it. Also keep "New invoice" as a visible button in the header on every invoice screen. Don't hide it in the overflow menu.

## 2. The email step is a dead end if anything goes wrong

**Where**: The "check your email" screen and the link in the email.

**How it breaks**: Maria types "maria@greenlinelawn.co" and leaves off the "m". The screen says "We sent a link to your email." It doesn't show the address, so she can't see the typo. She can't change the address, and there's no resend button. Or she types it right, gets pulled into her meeting, and opens the email 20 minutes later. The link expired after 15. In both cases the only way forward is to start the whole form again, and most people won't.

**Severity**: Critical.

**Fix**: Show the address on screen with a "Wrong address? Change it" link. Add a resend button that unlocks after 30 seconds. Make the link last at least 24 hours. When an expired link is opened, send a new one from that page. Don't send the person back to the form.

## 3. The account screen asks for nine things and buries the fast path

**Where**: The "create your account" screen.

**How it breaks**: On a phone, nine fields is four or five screens of scrolling. Phone number, company size, and "how did you hear about us" are all required, and none of them helps Maria create an account. The quickest route for her is "Sign in with Google," but that button sits below "Submit" as an unlabeled icon. She never scrolls that far, or she sees a "G" and doesn't know what it does. The page also shows two competing actions with no clear order between them.

**Severity**: High.

**Fix**: Put the labeled social sign-in buttons at the top ("Continue with Google", and so on), then a divider, then the form. Cut the form to email and password. Ask for name and company later, after they are inside the product. Remove "confirm password" and add a show/hide toggle instead. Change the "Submit" button label to "Create account".

## 4. One mistake costs the whole password twice

**Where**: When the account form has errors.

**How it breaks**: Maria enters a ten-character password. She only learns the rules after she submits. The form then clears both password fields and shows one red banner: "There was a problem with your submission." The fields with problems get red borders, but nothing says what is wrong. On a phone the banner is off screen once she scrolls down. The field labels are placeholder text that vanished when she typed, so she can't even tell which red field is which. She retypes a 12-character password with a symbol, twice, on a phone keyboard, and guesses at the rest.

**Severity**: High.

**Fix**: Show the password rules under the field before she types, and tick each rule off as she meets it. Keep what she typed after an error. Put a one-line message under each field that has a problem, and move focus to the first one. Use real labels above the fields, the way the rest of our forms do.

## 5. The team screen is a survey with a locked door

**Where**: The "tell us about your team" screen.

**How it breaks**: Maria has already told us her company size. This screen asks for it again, then requires a free-text answer about her "biggest invoicing challenge" before she can continue, and there's no way to skip. She's on a phone with a minute left. She types "idk" or quits. The progress dots also appear here for the first time, already on the third dot. That tells her nothing about the steps behind her and gives her no reason to trust what comes next.

**Severity**: Medium.

**Fix**: Make the whole screen skippable with a clear "Skip for now" link. Drop the repeated team-size question. Make the text area optional, or move it to a prompt inside the product a week later. Either show the progress indicator on every step or remove it.
