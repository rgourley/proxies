# Guest sharing, v1

Tilt's proposal for letting customers bring outside clients and contractors into one project without a paid seat. Draft for review before build.

## The flow

```mermaid
flowchart TD
  A[Seat member opens a project] --> B[Clicks Share and types an outside email]
  B --> C{Email already has a Tilt login?}
  C -- Yes --> D[Added to the project as a guest]
  C -- No --> E[Guest gets a magic link. No password]
  E --> F[Guest sees the project board and timeline]
  D --> F
  F --> G[Guest can comment, upload files, and @mention anyone in the workspace]
  G --> H{Guest clicks Edit on a task?}
  H -- Yes --> I[Prompt: ask the owner to make you a member]
  I --> J[Workspace owner gets a request to add a paid seat]
  H -- No --> K[Guest approves the deliverable]
  K --> L[Weekly AI status summary goes to everyone on the project, guests included]
```

## Rules in this draft

- Any seat member can invite a guest. There is no approval step.
- Guests are free and unlimited.
- A magic link stays valid for 30 days and can be forwarded.
- Guests appear in the project's member list with a "Guest" tag. There is no workspace-wide list of guests.
- Removing a guest takes them off the project. Their comments and files stay.
- The weekly AI summary is written from all activity in the project, including internal comments.
