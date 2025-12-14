// Firebase initialization (compat) - loads client config from /env.json
async function initFirebaseFromEnv(){
  let cfg = null;
  try{
    const res = await fetch('/env.json');
    if(res.ok) cfg = await res.json();
  }catch(e){ console.warn('Failed to load /env.json', e); }

  // Prefer explicit /env.json -> cfg.firebase, otherwise allow a page-level `window.__FIREBASE_CONFIG__`.
  const firebaseConfig = (cfg && cfg.firebase) ? cfg.firebase : (window.__FIREBASE_CONFIG__ || null);
  if(!firebaseConfig){
    console.error('No Firebase config found. Add Firebase config to /env.json or set window.__FIREBASE_CONFIG__. Firebase will not be initialized.');
    window.CONFIG = cfg || {};
    return; // abort initialization when no config is available
  }

  // Load compat libraries dynamically
  const s1 = document.createElement('script'); s1.src='https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js'; document.head.appendChild(s1);
  const s2 = document.createElement('script'); s2.src='https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js'; document.head.appendChild(s2);
  const s3 = document.createElement('script'); s3.src='https://www.gstatic.com/firebasejs/9.22.1/firebase-storage-compat.js'; document.head.appendChild(s3);
  const s4 = document.createElement('script'); s4.src='https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js'; document.head.appendChild(s4);

  s3.onload = () => {
    if(!window.firebase) return console.error('Firebase failed to load');
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    window.storage = firebase.storage();
    window.auth = firebase.auth();
    window.CONFIG = cfg || {};
    console.log('Firebase initialized');
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
