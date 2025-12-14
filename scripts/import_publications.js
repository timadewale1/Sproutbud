/**
 * Server-side import script to upload PDFs to Firebase Storage and create
 * Firestore documents in `publications` collection.
 *
 * Usage:
 * 1. Place a Firebase service account JSON file (serviceAccount.json) next to this script.
 * 2. Install dependencies: `npm install` (see package.json included)
 * 3. Run: `node import_publications.js ./Media/publications` (folder with PDFs)
 *
 * NOTE: This script runs locally and requires Node.js and a service account.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');

async function main() {
  const args = process.argv.slice(2);
  if(!args[0]){
    console.error('Usage: node import_publications.js <folder-with-pdfs>');
    process.exit(1);
  }
  const folder = args[0];
  const svcPath = path.join(__dirname, '..', 'serviceAccount.json');
  if(!fs.existsSync(svcPath)){
    console.error('Missing serviceAccount.json in scripts/ - place your Firebase service account there.');
    process.exit(1);
  }

  const serviceAccount = require(svcPath);
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || serviceAccount.project_id + '.appspot.com';
  initializeApp({ credential: cert(serviceAccount), storageBucket: bucketName });
  const storage = getStorage();
  const db = getFirestore();

  const files = fs.readdirSync(folder).filter(f => f.toLowerCase().endsWith('.pdf'));
  if(files.length === 0){ console.log('No PDFs found in', folder); return; }

  for(const fileName of files){
    const localPath = path.join(folder, fileName);
    const destPath = `publications/${Date.now()}_${fileName}`;
    console.log('Uploading', fileName, '->', destPath);
    const bucket = storage.bucket();
    await bucket.upload(localPath, { destination: destPath, metadata: { contentType: 'application/pdf' } });
    const file = bucket.file(destPath);
    const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 });
    // Create metadata doc
    const pub = {
      title: path.parse(fileName).name,
      fileName,
      storagePath: destPath,
      fileUrl: url,
      importedAt: new Date()
    };
    const docRef = await db.collection('publications').add(pub);
    console.log('Created publication doc', docRef.id);
  }
  console.log('Done');
}

main().catch(err=>{ console.error(err); process.exit(1); });
