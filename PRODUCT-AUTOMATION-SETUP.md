# Akeem Store Product Automation

## Included in this branch
- Dedicated Product Automation page linked from the existing admin sidebar.
- Reads the existing Firestore `products` catalogue; does not duplicate or rewrite product records.
- Creates and edits campaign drafts in `marketingCampaigns`.
- Campaign review states: draft → pending approval → approved/rejected. Pending campaigns can be edited; edits must be reviewed again. Approved campaigns are immutable.
- Only approved campaigns expose a WhatsApp share action. Approval never sends or publishes automatically.
- Direct-recipient campaigns require the administrator to confirm recorded marketing opt-in. The confirmation is saved with the campaign and enforced by Firestore rules.
- Adds static CI checks for JavaScript syntax and approval/security invariants.

## Firebase setup
The branch is based on `firebase-separation-akeems-store`, which configures the Akeem Store Firebase project. Deploy the branch's updated `firestore.rules` to that Firebase project before using campaign storage. Rules restrict campaign records to the verified owner account `akeem.fatai15@gmail.com`.

## WhatsApp limitations
The WhatsApp Business Platform API is not connected. No Meta token or phone-number ID was supplied, and no credential is embedded in browser code. At present, an approved campaign opens a prefilled WhatsApp chat/share screen; an administrator must review and press Send manually. It does not automate WhatsApp Status or group posts. Automated delivery requires a Meta WhatsApp Business Platform account, phone-number ID, access token stored in server secrets, approved templates where required, opt-in records, a secure backend, and server-side enforcement of the approved campaign state.

## AI content limitations
The caption starter uses saved product fields and a template. It is not an AI model call. AI copy and creative generation require a secured server-side AI provider integration and a configured secret; no API key was supplied, so no client-side secret or fake AI behavior was added.

## Scheduling and verification
No automatic campaign scheduler is enabled. Scheduling without a deployed delivery backend would mislead administrators into thinking messages will be sent. Static checks run in GitHub Actions. Live Firebase and WhatsApp delivery still require deployment credentials and an end-to-end test in the owner's environment.
