# Ama, Accessibility specialist

**Verdict**: Block. The draft breaks both of my hard lines: errors are shown only in red, and the social sign-in buttons have no name a screen reader can say.

## 1. The error state shows problems only in red

**Where**: The create-your-account screen, after a failed submit.

**How it breaks**: A shop owner with low vision uses VoiceOver, the screen reader built into the iPhone. They submit the nine-field form. The phone says "There was a problem with your submission." That is all. The fields with problems get a red border, which VoiceOver does not read and a colour-blind user may not see. Focus stays on the button, so they have to swipe through nine fields to guess. Both password fields are now empty, so they retype them too. That breaks the Web Content Accessibility Guidelines (WCAG) rules on colour (1.4.1) and on describing errors (3.3.1). Five minutes is gone. They quit.

**Severity**: Critical. It breaks a hard line, and it blocks every user who makes one mistake.

**Fix**: Put a text message under each field with an error, such as "Enter a phone number with 10 digits." Link each message to its field so the screen reader reads it. Move focus to a summary that lists each error as a link. Keep the password fields filled.

## 2. The social sign-in buttons are icons with no names

**Where**: The three Google, Microsoft, and Apple buttons under the submit button.

**How it breaks**: A user who is blind wants to skip the long form and use their Google account. VoiceOver reads each one as "button" or, at best, as an image file name. They cannot tell which is Google. A user with low cognitive load tolerance or older eyes on a small phone screen also has to guess from a small logo. The fastest path through sign-up is the one that is closed to screen reader users.

**Severity**: Critical. It breaks a hard line.

**Fix**: Add visible text to each button: "Continue with Google", "Continue with Microsoft", "Continue with Apple". The visible text then becomes the name the screen reader says. Make each button at least 24 by 24 CSS pixels, which is the WCAG 2.2 minimum target size, and preferably 44.

## 3. The field labels disappear when someone starts typing

**Where**: Every field on the create-your-account screen.

**How it breaks**: The labels are grey placeholder text inside the fields. A user types their first name, gets interrupted by a meeting reminder, and comes back. Every filled field now shows only what they typed. They cannot tell which box was "Company name" and which was "How did you hear about us?" Placeholder grey usually fails the contrast minimum of 4.5 to 1. Some screen readers skip placeholder text or read it inconsistently. A person with memory or attention limits loses their place on a nine-field form with no way back.

**Severity**: High.

**Fix**: Use a real, visible label above each field that stays put. Mark required fields in text, such as "(required)", not with colour. Also cut the form down: phone number, company size, and how you heard about us are not needed to make an account.

## 4. The email link expires in 15 minutes with no resend and no address shown

**Where**: The check-your-email screen.

**How it breaks**: A user with a motor impairment uses switch control, where one or two buttons step through the screen. Switching apps to open their mail, finding the message, and following the link takes them far longer than it takes most people. A meeting starts in the middle. The link has expired. The screen does not show which address the link went to, so they cannot tell if they mistyped it. There is no resend button and no way to change the address. Their only option is to fill the nine-field form again. That conflicts with the WCAG rule on adjustable time limits (2.2.1).

**Severity**: High.

**Fix**: Show the email address on the screen. Add "Resend link" and "Change email" buttons with visible text. Make the link last at least 24 hours. If you add a code as an option, let people paste it and do not split it into one box per digit.

## 5. The password rules appear only after the user fails them

**Where**: The password field on the create-your-account screen.

**How it breaks**: The rules are 12 characters, a number, a symbol, and an uppercase letter. Nobody sees them until the submit fails. A user with dyslexia makes a password that meets most of the rules, submits, sees a vague red banner, finds both password fields cleared, and now has to read a rule sentence they did not see before. Each failed attempt means typing two hard passwords again on a phone keyboard. That breaks the WCAG rule that instructions must come before input (3.3.2).

**Severity**: Medium. It is a high source of failure for people with cognitive and motor limits, but the form is still usable once they find the rules.

**Fix**: Show the rules as text under the password field before the user types. Update each rule with a text status, such as "Met" or "Not met yet", that a screen reader announces politely, not with a colour change alone. Remove the confirm-password field and add a "Show password" button instead.
