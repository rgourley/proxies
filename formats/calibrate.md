# Format: calibrate

Calibration compares a proxy's responses with real feedback from someone in the same role, such as a customer interview, a stakeholder's comments, or a review. The facilitator runs this, not a proxy.

Inputs:
- The proxy file.
- The proxy's response from a run, if the user names one.
- The real feedback, from the user.

The facilitator writes:
- **Matches**: points the proxy raised that the real feedback also raised.
- **Misses**: points the real feedback raised that the proxy did not.
- **False alarms**: points the proxy raised that the real feedback did not care about.
- **Proposed edits**: exact changes to the proxy file fields (measured_on, hard_lines, blind_spots, voice, or the body). Each edit names the miss or false alarm it fixes.

The user approves the edits before they are written. Every calibration is appended to `orgs/<org>/calibration/<handle>.md` with the date and the run folder.
