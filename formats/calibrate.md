# Format: calibrate

Calibration compares a person's responses to what the real person said. The facilitator runs this, not a person.

Inputs:
- The person file.
- The person's response from a run, if the user names one.
- What the real person said, from the user.

The facilitator writes:
- **Matches**: points the person predicted correctly.
- **Misses**: points the real person raised that the person did not.
- **False alarms**: points the person raised that the real person did not care about.
- **Proposed edits**: exact changes to the person file fields (measured_on, hard_lines, blind_spots, voice, or the body). Each edit names the miss or false alarm it fixes.

The user approves the edits before they are written. Every calibration is appended to `orgs/<org>/calibration/<handle>.md` with the date and the run folder.
