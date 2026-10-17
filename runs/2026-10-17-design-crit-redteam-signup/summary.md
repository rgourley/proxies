## Who blocks, and why

Two of five would stop it. The other three want changes before it is built.

- **Ama** blocks because errors show only in red, and the social sign-in buttons are icons with no name that a screen reader can say. Both break their hard lines.
- **June** blocks because she would not get past the account form on her phone in five minutes, and the email step would lose her for good.

## Findings, ranked

| # | Finding | Severity | Raised by |
|---|---|---|---|
| 1 | A failed submit clears both password fields, and the banner "There was a problem with your submission" does not say what is wrong. Errors show only as red borders | Critical | All 5 |
| 2 | "Check your email" is a dead end: it shows no address, offers no resend and no way to change the email, and the link expires in 15 minutes | Critical | Noor, Diego, June, Ama, Felix |
| 3 | The dashboard is an empty table with no message, and "New invoice" is hidden in the overflow menu | Critical | Noor, Diego, June |
| 4 | Labels are placeholders that vanish when the person types | High | Felix, Ama, Diego |
| 5 | The social sign-in buttons are icons with no text and no name for a screen reader | Critical | Ama, Felix, June |
| 6 | The account form asks for nine things, including a required phone number, before the person sees the product | High | Noor, June |
| 7 | Password rules appear only after the person fails them | High | Felix, Ama |
| 8 | No button has a loading or offline state, so a slow network can create duplicate accounts | High | Diego |
| 9 | The team screen asks for team size again, requires a free-text answer, and cannot be skipped | Medium | Noor |
| 10 | Labels use the company's words, not the customer's | Medium | Felix |

## What to fix first

1. **Keep what the person typed when the form has an error, and say beside each field what is wrong.** Do not rely on red alone. (All 5)
2. **Make "Check your email" recoverable:** show the address, let the person change it, add a resend, and give the link longer than 15 minutes. (Noor, Diego, June, Ama, Felix)
3. **Give the empty dashboard one clear first step:** a short message and a visible "Create your first invoice" button. (Noor, Diego, June)
4. **Use visible labels above the fields, and give each social sign-in button its name in words.** (Felix, Ama, Diego, June)
5. **Cut the account form to what sign-up needs:** email and password, or a social sign-in. Show the password rules before the person types. Ask the rest later, and let them skip it. (Noor, June, Felix, Ama)
