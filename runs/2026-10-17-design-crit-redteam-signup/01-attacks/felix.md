# Felix, Content designer

**Verdict**: Rework. The error state breaks my hard line: "There was a problem with your submission" says neither what happened nor what to do next, and on a phone it costs the owner both passwords.

## 1. The error banner says nothing and wipes the passwords

**Where**: When the account form has errors.

**How it breaks**: Dana runs a four-person landscaping firm. She is on her phone in a parking lot with five minutes before a client call. She taps "Submit." The page shows "There was a problem with your submission." Her password fields are now empty, and three fields have red borders with no reason given. She cannot tell whether her password was too short or her phone number had dashes. She retypes two passwords on a phone keyboard, guesses, and fails again. Then she closes the tab.

**Severity**: Critical. This breaks my hard line that every error says what happened and what to do next.

**Fix**: Put a message under each failing field, in plain words: "Use at least 12 characters, including a number, a symbol, and a capital letter." Keep the passwords filled in. Change the banner to "2 fields need fixing" and make it a link to the first of them.

## 2. Password rules appear only after she fails

**Where**: The password field on the account form.

**How it breaks**: Dana types the password she uses everywhere, "Greenleaf2019." She only learns the rule after the form rejects it and clears it. The rule then asks for four things at once in one sentence: "12+ characters with a number, a symbol, and an uppercase letter." She now has to invent a password she has never used, type it twice, and keep the sentence in her head. That is a password-reset ticket next week.

**Severity**: High.

**Fix**: Show the rule under the field before she types. Check each part live as she types. Drop the confirm field and offer a "Show password" toggle instead. One field with visible text beats two blind ones on a phone.

## 3. Placeholder labels vanish, and social sign-in has no words

**Where**: All fields on the account form, and the sign-in icons under the button.

**How it breaks**: The labels sit inside the fields and disappear when Dana starts typing. Halfway through a nine-field form on a small screen, she cannot see whether the box she is in wants a company name or the phone number. Autofill makes this worse, because it fills boxes she then cannot identify. The three bare logos under "Submit" are the fastest way in, but she would scroll past them. A "G" in a circle does not say "Sign up with Google." She also has no reason to think a logo means "skip this form."

**Severity**: High.

**Fix**: Put a visible label above each field. Move social sign-in above the form and label it in words: "Continue with Google," "Continue with Microsoft," "Continue with Apple." Then add a divider that says "or sign up with email."

## 4. "Almost there!" does not say where the email went or what to do if it never arrives

**Where**: The check-your-email screen.

**How it breaks**: Dana has a typo in her email: "dana@greenleaf.con." The screen says "We sent a link to your email." It does not show the address, so she cannot see the mistake. She cannot change it and she cannot resend. She goes into her meeting. The link expires in 15 minutes. When she comes out, the link is dead and the screen offers her nothing. Her only choices are to start the nine-field form again or to email support. "Almost there!" is cheerful copy on a dead end.

**Severity**: High.

**Fix**: "We sent a link to dana@greenleaf.con. It works for 24 hours." Add "Wrong email? Change it" and "Resend link." Add a line that says "Check your spam folder if it is not there in a minute." The expired-link page should say what happened and give her one button to get a new link.

## 5. Labels in our words, not hers

**Where**: The account form button and checkbox, the team questions, and the empty dashboard.

**How it breaks**: "Submit" describes our database, not her goal. The one checkbox bundles the legal terms with marketing emails, so Dana either accepts spam or cannot sign up. That is a trust problem on a product that handles her money. The team screen asks for team size a second time and makes "What's your biggest invoicing challenge?" required with no skip. She types "idk" to get past it. Then she reaches a dashboard with empty headers and no words at all. The one thing she came to do, "New invoice," is hidden in an overflow menu.

**Severity**: Medium.

**Fix**: Change "Submit" to "Create account." Split the checkbox: terms required, marketing optional and unchecked. Delete the repeated team-size question and make the challenge question optional. In the empty table, add "No invoices yet" and a "Create your first invoice" button.
