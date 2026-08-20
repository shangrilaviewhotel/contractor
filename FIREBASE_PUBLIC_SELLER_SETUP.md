# Public Seller Submission — Firebase setup

The public `sell.html` page now uses the **same Cloudinary media-upload workflow as the existing admin Add New Product form**. It does **not** upload product media to Firebase Storage.

Visitor listings are stored separately in the Firestore collection:

```text
pendingProductSubmissions
```

They remain `status: "pending"` until an authenticated administrator approves them. Approval creates a normal document in the existing `products` collection using the same core product fields used by the admin product form.

## Firebase Storage

**Do not upgrade Firebase to Blaze just for this feature.** No Firebase Storage bucket is required by the public seller workflow.

Your existing `firebase.js` still exports the Firebase Storage service for compatibility with the existing project. The public seller page does not call Firebase Storage; media goes through the same Cloudinary upload configuration already used by the admin workflow.

## Firestore rules — important

The repository does not contain your deployed Firestore rules, so the rules in the Firebase Console must be updated there. Do **not** leave the database on the development rule shown in your screenshot (`allow read, write: if true`) when the public seller feature is live. Firebase explicitly warns that open read/write rules let anyone overwrite or delete database data.

The minimum required behavior is:

```text
match /pendingProductSubmissions/{submissionId} {
  // Visitor: create only a pending public-seller submission.
  allow create: if request.auth == null
    && request.resource.data.status == 'pending'
    && request.resource.data.reviewStatus == 'pending'
    && request.resource.data.source == 'public-seller'
    && request.resource.data.published == false;

  // Admin only: review and change pending submissions.
  allow read, update, delete: if request.auth != null
    && request.auth.token.admin == true;
}

match /products/{productId} {
  // Public storefront can read products.
  allow read: if true;

  // Only the administrator can create/edit/delete products.
  allow create, update, delete: if request.auth != null
    && request.auth.token.admin == true;
}
```

Keep your existing rules for all other collections and merge these paths into them; do not replace unrelated rules.

### Admin authorization

The recommended production setup is an `admin == true` Firebase Authentication custom claim on the store owner's account. Firebase Security Rules expose custom claims through `request.auth.token`, which allows the rules to distinguish the administrator from ordinary authenticated users.

If your current login system does not yet assign the `admin` custom claim, the code can still be tested while your existing development rules remain in place, but **secure the rules before public launch**.

## No collection needs to be created manually

Firestore creates `pendingProductSubmissions` automatically when the first visitor submits a listing. Existing `products`, `categories`, and `brands` data are not changed by the public form.

## Visitor workflow

```text
Visitor
  ↓
Sell page
  ↓
Same product fields + media upload + seller contact
  ↓
pendingProductSubmissions
  ↓
Admin dashboard → Visitor Posts
  ↓
Approve / Reject
  ↓
Approved → products
  ↓
Public storefront
```
