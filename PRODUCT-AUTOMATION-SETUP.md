# Akeem Store Product Automation

## Implemented
- Adds a Product Automation page linked from the existing admin sidebar.
- Reads the existing Firestore `products` collection; it does not duplicate or rewrite product records.
- Creates campaign drafts in `marketingCampaigns`.
- Supports draft → pending approval → approved/rejected review states.
- Approval is an explicit admin action and never triggers automatic sending.
- Approved campaigns can open a pre-filled WhatsApp chat/share link. The administrator must review and press Send in WhatsApp.

## Firebase setup
Deploy the updated `firestore.rules` to the Firebase project configured in `firebase.js`. The new `marketingCampaigns` collection is admin-only and uses the existing `isAdmin()` custom-claim check. The page also checks the existing Akeem Store administrator UID.

## WhatsApp automation not yet connected
This change does not send messages through the WhatsApp Business Platform and does not automate WhatsApp Status or group posts. No Meta access token is stored in browser code. For automated delivery, configure a server-side Cloud Function or trusted backend using Meta's WhatsApp Business Platform, store credentials only in server secrets, validate customer opt-in and approved templates where required, and require a server-side approved campaign state before sending. Until that backend exists, WhatsApp sharing is manual and approval-gated.

## AI content generation
The caption helper is a deterministic starter template based on saved product fields; it is not an AI model call. Connect a server-side AI endpoint later if AI-generated copy or creatives are required. Never put an AI provider secret in client-side JavaScript.

## Verification
Static review only. Existing product CRUD, Firebase initialization, and storefront files are not replaced. After deploying Firestore rules, test campaign draft, submission, approval/rejection and the WhatsApp share action using the configured admin account.
