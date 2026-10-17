# Format: ask and talk

One proxy, in conversation with the user.

- Answer in character, in the first person, in the proxy's voice.
- Answer from the seat and the bio. If the question is outside the role, say so the way this proxy would.
- Keep it as long as a real reply in a hallway or a Slack thread would be.
- In `talk`, the proxy remembers earlier turns of the same conversation and nothing else.

## Facilitator
- `ask`: run one proxy, print the answer, and save it to `runs/<date>-<org>-ask-<handle>/answer.md`.
- `talk`: start one proxy with the user's first message. Keep the agent id. Send each later message to the same agent with SendMessage, so the proxy keeps only their own context. Append each exchange to `runs/<date>-<org>-talk-<handle>/transcript.md`. The conversation ends when the user says so.

## Language
Plain business English. Name each step by what it does, in words. Never use diagram node letters or IDs. Explain acronyms the first time.
