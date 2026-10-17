# Diego, Front-end engineer

**Verdict**: Rework. The draft designs the happy path only: the error state works against the person, there is no loading state anywhere, and the empty dashboard is blank, so I would not start the build from this.

I went through the states each screen can be in. These are idle, typing, submitting, server error, network drop, expired link, and empty. The draft covers about two of them. Here is where our phone user, a bakery owner with five minutes between meetings, gets stuck.

## 1. A failed submit wipes the passwords and doesn't say what went wrong

**Where**: The create-account form, when it comes back with errors.

**How it breaks**: She fills nine fields on her phone with her thumb. The password is 11 characters. She taps Submit. Both password fields clear. A banner says "There was a problem with your submission." Phone number also has a red border, because she typed a space. She can't tell what is wrong with either field. She retypes 24 characters of password blind and guesses at the phone format. Most people quit on the second try.

**Severity**: Critical. This is the most-hit error path in the flow, and it is designed to fail.

**Fix**: Keep every value after a failed submit, password included. The value never leaves the page, so clearing it gains nothing. Put one plain sentence under each bad field. Show the password rules from the start and tick each one off as she types. Validate each field when she leaves it, so most errors never reach Submit. Drop the requirement to confirm the password and add a show-password toggle instead.

## 2. The check-your-email screen is a dead end on a phone

**Where**: The check-your-email screen, and the tap on the link in the email.

**How it breaks**: She signs up in Safari. The email opens in Gmail's in-app browser, which shares no session with Safari. Or it lands in the Promotions tab and she finds it 20 minutes later, after the 15-minute expiry. Or she mistyped "bakery@gmial.com". The screen doesn't show the address. She can't fix a typo and can't resend. Every one of these ends with an abandoned account row and a support ticket. If she tries again, she gets "email already in use".

**Severity**: Critical. This is partial completion: the account exists but she can't get into it.

**Fix**: Show the address with a "Wrong email? Change it" link. Add a resend button with a 30-second cooldown. Extend the link to 24 hours. Make the link work in any browser, so a click in a different browser still signs her in and resumes setup. Design the expired-link page with a one-tap "Send a new link". If the email is already registered but not verified, resend the link. Don't show an error.

## 3. No loading or offline state on any button

**Where**: The Submit button on the create-account form, and the Continue button on the team questions screen.

**How it breaks**: She is on patchy cellular in a hallway. She taps Submit. Nothing visibly happens for three seconds, so she taps again. Two requests go out. That gives us two verification emails, and one of them is already invalid, or a duplicate-account error on the second request that we show as a failure. If the connection drops entirely, the draft has no state at all. We'd likely show the generic red banner, and per breakage 1, her passwords would clear.

**Severity**: High. At 2am this is a duplicate-account bug that support can't reproduce.

**Fix**: Disable the button and show a spinner while the request is in flight. Make the create-account call safe to repeat on the server. Add one network-error message that keeps every field filled: "No connection. Your details are saved. Try again."

## 4. Placeholder labels and custom controls fight the phone

**Where**: All fields on the create-account form, the social sign-in icons, and the dropdowns on both form screens.

**How it breaks**: She taps "Company size", then types "8", and the label disappears. After that she can't tell which field is which without clearing it. Password managers and the phone's autofill key off real labels and input types, so her saved name and email don't fill. The three dropdowns are probably custom, going by our usual library habits. That breaks the native picker on iOS (Apple's iPhone system) and Android. Icon-only Google, Microsoft, and Apple buttons have no text, so screen readers read "button" three times.

**Severity**: High. This hits my hard line on native controls, and it slows every phone user.

**Fix**: Put visible labels above the fields. Use the correct input types and autocomplete attributes (the hints that let the phone autofill email, name, and phone). Use native select menus. Add text to the social buttons: "Continue with Google". Better still, put the social buttons above the form, since one tap there skips almost all of this.

## 5. The dashboard has no empty state and hides the first action

**Where**: The dashboard, the first time she lands on it.

**How it breaks**: She finally gets in with one minute left before her meeting. She sees five column headers and nothing else. "New invoice" is in the top-right overflow menu, which is a tiny target on a phone that nobody opens on a first visit. A five-column table also won't fit a 375-pixel-wide phone screen without horizontal scrolling. She closes the tab and doesn't come back. We also have no designed loading state for this table, so a slow first load looks identical to "you have nothing".

**Severity**: High. This is my hard line on empty and loading states, and it wastes everything she did to get here.

**Fix**: Add an empty state with one sentence and a primary "Create your first invoice" button. Add a skeleton loading state, meaning grey placeholder rows while data loads, so loading reads differently from empty. Specify how the table collapses to a card list on narrow screens.

I'll note two things outside my five. The team questions screen repeats team size and has a required essay with no skip, which is extra work for us and for her. And the progress bar there shows three dots with the third filled, but she has been through four steps. Both are cheap to cut, and I'd cut them.
