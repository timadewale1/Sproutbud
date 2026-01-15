// Firebase initialization (compat) - loads client config from API or /env.json
async function initFirebaseFromEnv(){
  let cfg = null;

  // Try to load from API first (for production)
  try{
    const res = await fetch('/api/config');
    if(res.ok) cfg = await res.json();
  }catch(e){
    console.warn('Failed to load config from API, trying /env.json', e);
    // Fallback to /env.json (for local development)
    try{
      const res = await fetch('/env.json');
      if(res.ok) cfg = await res.json();
    }catch(e2){ console.warn('Failed to load /env.json', e2); }
  }

  // Check for environment variables as fallback (client-side only uses window variables)
  const vercelFirebaseConfig = {
    apiKey: window.FIREBASE_API_KEY,
    authDomain: window.FIREBASE_AUTH_DOMAIN,
    projectId: window.FIREBASE_PROJECT_ID,
    storageBucket: window.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID,
    appId: window.FIREBASE_APP_ID
  };

  // Check if Vercel config has all required fields
  const hasVercelConfig = vercelFirebaseConfig.apiKey && vercelFirebaseConfig.projectId;

  // Prefer API config, then /env.json, then Vercel env vars, otherwise allow a page-level `window.__FIREBASE_CONFIG__`.
  const firebaseConfig = (cfg && cfg.firebase) ? cfg.firebase :
                        (hasVercelConfig ? vercelFirebaseConfig :
                        (window.__FIREBASE_CONFIG__ || null));

  if(!firebaseConfig){
    console.error('No Firebase config found. Add Firebase config to /env.json or set window.__FIREBASE_CONFIG__. Firebase will not be initialized.');
    window.CONFIG = cfg || {};
    return; // abort initialization when no config is available
  }

  // Load compat libraries dynamically in sequence
  const s1 = document.createElement('script');
  s1.src='https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';
  document.head.appendChild(s1);

  s1.onload = () => {
    const s2 = document.createElement('script');
    s2.src='https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js';
    document.head.appendChild(s2);

    s2.onload = () => {
      const s3 = document.createElement('script');
      s3.src='https://www.gstatic.com/firebasejs/9.22.1/firebase-storage-compat.js';
      document.head.appendChild(s3);

      s3.onload = () => {
        const s4 = document.createElement('script');
        s4.src='https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js';
        document.head.appendChild(s4);

        s4.onload = () => {
          if(!window.firebase) return console.error('Firebase failed to load');
          firebase.initializeApp(firebaseConfig);
          window.db = firebase.firestore();
          window.storage = firebase.storage();
          window.auth = firebase.auth();
          window.CONFIG = cfg || {};
          console.log('Firebase initialized');
        }
      }
    }
  }
}

initFirebaseFromEnv();

// Helper to load and execute Google reCAPTCHA v3; returns token or empty string
function getRecaptchaToken(siteKey){
  return new Promise((resolve)=>{
    if(!siteKey){ resolve(''); return; }
    const existing = document.querySelector('script[data-recaptcha]');
    const run = ()=>{
      try{
        if(window.grecaptcha && window.grecaptcha.execute){
          window.grecaptcha.ready(()=>{
            window.grecaptcha.execute(siteKey, {action: 'submit'}).then(token=> resolve(token)).catch(()=> resolve(''));
          });
        }else{ resolve(''); }
      }catch(e){ console.warn('recaptcha error', e); resolve(''); }
    };
    if(existing){ run(); }
    else{
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      s.setAttribute('data-recaptcha','1');
      s.onload = run; document.head.appendChild(s);
    }
  });
}

// Helper: upload file to storage and return download URL
async function uploadFile(path, file, onProgress) {
  const ref = storage.ref().child(path);
  const task = ref.put(file);
  return new Promise((resolve, reject) => {
    task.on('state_changed', snap => {
      if(onProgress) onProgress((snap.bytesTransferred / snap.totalBytes) * 100);
    }, reject, async ()=> {
      const url = await ref.getDownloadURL(); resolve(url);
    });
  });
}

// Helper: create post document
async function createPost(data) {
  const doc = await db.collection('posts').add({...data, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
  return doc.id;
}

// Authentication helpers
function signIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function signOutUser(){
  return auth.signOut();
}

function onAuthStateChanged(cb){
  return auth.onAuthStateChanged(cb);
}

// Publications helpers
async function createPublication(meta){
  const doc = await db.collection('publications').add({...meta, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
  return doc.id;
}

async function uploadPublicationFile(file, onProgress){
  const path = `publications/${Date.now()}_${file.name}`;
  const url = await uploadFile(path, file, onProgress);
  return { path, url };
}

// Save volunteer/partner/donation records
async function saveVolunteer(data){
  const doc = await db.collection('volunteers').add({...data, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
  return doc.id;
}

async function savePartner(data){
  const doc = await db.collection('partners').add({...data, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
  return doc.id;
}

async function saveDonation(data){
  const doc = await db.collection('donations').add({...data, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
  return doc.id;
}
