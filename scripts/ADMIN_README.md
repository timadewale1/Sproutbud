Admin setup
===========

This folder contains helper scripts to create an admin user and guidance for Firestore security.

Create admin user
-----------------
1. Copy your Firebase service account JSON to `scripts/serviceAccount.json` (do NOT commit it).
2. From the `scripts/` directory run:

```bash
npm install firebase-admin minimist dotenv
node create_admin_user.js --email sproutbudadmin@gmail.com --password Sproutbud123
```

This script will create the user (if missing) and set the custom claim `admin: true`.

Firestore rules guidance
------------------------
- We recommend restricting writes to sensitive collections (publications, posts) to authenticated users with `admin: true`.
- Public form collections (volunteers, partners, donations) are safer when written by a trusted server endpoint after verifying reCAPTCHA. If you must allow client writes, monitor and rate-limit.

See `firestore.rules` at repo root for a starting template.
