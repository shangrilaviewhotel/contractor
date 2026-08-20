# Public Seller Submission — Firebase setup

The website now uses a separate Firestore collection named `pendingProductSubmissions` for visitor listings.

**Important:** this repository does not contain the current Firestore Security Rules, so the rules in Firebase Console must be configured to permit anonymous creation of a pending submission while preventing anonymous publication/editing of the `products` collection.

Recommended security model:

```text
match /pendingProductSubmissions/{submissionId} {
  allow create: if request.auth == null
    && request.resource.data.status == 'pending'
    && request.resource.data.reviewStatus == 'pending'
    && request.resource.data.source == 'public-seller';

  allow read, update, delete: if request.auth != null
    && request.auth.token.admin == true;
}

match /products/{productId} {
  allow read: if true;
  allow create, update, delete: if request.auth != null
    && request.auth.token.admin == true;
}
```

Use your existing rules for all other collections and merge these rules into them rather than replacing unrelated rules.

The `admin` custom claim should be assigned only to the store owner's Firebase Auth account. If the current admin account does not use an `admin` custom claim, the existing rules must be adapted to the repository's current admin authorization method before enabling public submissions.

Cloudinary media uploads use the same unsigned upload preset already used by the existing admin workflow. No Firebase Storage change is required for the new visitor page.
