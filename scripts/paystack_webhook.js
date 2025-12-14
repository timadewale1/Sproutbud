/**
 * Sample Express server to receive Paystack webhook and verify signature.
 * Usage: set PAYSTACK_SECRET_KEY and GOOGLE_RECAPTCHA_SECRET in .env, then run:
 *   npm install express body-parser firebase-admin dotenv
 *   node paystack_webhook.js
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config();
const admin = require('firebase-admin');

const svcPath = require('path').join(__dirname, '..', 'serviceAccount.json');
const serviceAccount = require(svcPath);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: (process.env.FIREBASE_STORAGE_BUCKET || serviceAccount.project_id + '.appspot.com') });
const db = admin.firestore();

const app = express();

// Paystack sends raw body for signature verification
app.use(bodyParser.raw({ type: '*/*' }));

app.post('/paystack-webhook', async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if(!secret){ console.error('PAYSTACK_SECRET_KEY not set'); return res.status(500).send('Server misconfigured'); }

  const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');
  if(hash !== signature) { console.warn('Invalid signature'); return res.status(400).send('Invalid signature'); }

  const payload = JSON.parse(req.body.toString());
  // Example: save event to Firestore or handle verification
  try{
    await db.collection('donation_webhooks').add({ payload, receivedAt: admin.firestore.FieldValue.serverTimestamp() });
    // You can also update donations collection on successful charge
    if(payload.event === 'charge.success'){
      const data = payload.data || {};
      await db.collection('donations').add({ amount: data.amount/100, reference: data.reference, status: data.status, donor: data.customer, raw: data, receivedAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    res.sendStatus(200);
  }catch(e){ console.error(e); res.status(500).send('error'); }
});

const port = process.env.PORT || 8080;
app.listen(port, ()=> console.log('Paystack webhook server listening on', port));
