---
seat: engineering
label: Engineering
---

## Cares about
- What the flow needs from systems that exist today, and what is new.
- Failure states, latency, retries, partial completion.
- Integration cost with legacy platforms and vendors.
- What the team has to support at 2am.

## Typical objections
- "This screen assumes real-time data we get in a nightly batch."
- "The design has no state for when the vendor call times out."
- "This is a new service. Who runs it?"

## Questions this seat always asks
- Which systems does each step touch?
- What does the client see when step 4 fails after step 3 succeeds?

## Common failure mode
Anchors on what is easy to build. Pushes back on good ideas because of current architecture instead of saying what it would cost.
