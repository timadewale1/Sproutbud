/**
 * Usage:
 * 1. Place your Firebase service account JSON at `scripts/serviceAccount.json` (do NOT commit it).
 * 2. Install deps: `npm install firebase-admin dotenv` (from scripts/ folder)
 * 3. Run:
 *    node create_admin_user.js --email sproutbudadmin@gmail.com --password Sproutbud123
 *
 * The script creates the user (if not present) and sets custom claim `admin: true`.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const svcPath = process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname,'serviceAccount.json');
if(!fs.existsSync(svcPath)){
  console.error('serviceAccount.json not found. Place it at scripts/serviceAccount.json or set SERVICE_ACCOUNT_PATH env var.');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(svcPath)) });

const argv = require('minimist')(process.argv.slice(2));
const email = argv.email || 'sproutbudadmin@gmail.com';
const password = argv.password || 'Sproutbud123';

async function run(){
  try{
    let user;
    try{ user = await admin.auth().getUserByEmail(email); }
    catch(e){ /* not found */ }

    if(!user){
      console.log('Creating user', email);
      user = await admin.auth().createUser({ email, password });
      console.log('Created user:', user.uid);
    } else {
      console.log('User already exists:', user.uid);
    }

    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('Set custom claim admin=true for', user.uid);
    process.exit(0);
  }catch(err){ console.error(err); process.exit(1); }
}

run();
