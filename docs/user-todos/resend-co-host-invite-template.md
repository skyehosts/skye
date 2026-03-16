# Create co-host invite email template in Resend

## What

Create a new email template in the Resend dashboard with ID `co_host_invite`.

## Template variables

- `inviteLink` — the deep link to accept the invite (e.g. `skye-hosts://co-host/invite-landing?token=...`)
- `listingTitle` — the name of the listing
- `inviterName` — the name of the person who sent the invite

## Suggested content

Subject: "You've been invited to co-host {listingTitle}"

Body should include:

- Who invited them (`inviterName`)
- Which listing (`listingTitle`)
- A CTA button/link pointing to `inviteLink`
- Mention that the invite expires in 7 days
