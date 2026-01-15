// admin/js/app.js
// Basic auth routing and section toggles

// Wait until firebase helpers attach (window.auth)
function whenFirebaseReady(cb){
  const t = setInterval(()=>{
    if(window.auth){ clearInterval(t); cb(); }
  }, 150);
}

whenFirebaseReady(()=>{
  // wire login form on /admin/index.html
  const loginForm = document.getElementById('login-form');
  if(loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const status = document.getElementById('login-status');
      status.textContent = 'Signing in...';
      try{
        await signIn(email, password);
        status.textContent = 'Login successful! Redirecting to dashboard...';
        setTimeout(() => window.location.href = '/admin/dashboard.html', 1500);
      }catch(err){ console.error(err); status.textContent = 'Sign-in failed: '+(err.message||err); }
    });
  }

  // signup form - create new admin account
  const signupForm = document.getElementById('signup-form');
  if(signupForm){
    signupForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('su-name').value.trim();
      const email = document.getElementById('su-email').value.trim();
      const password = document.getElementById('su-password').value;
      const status = document.getElementById('signup-status');
      if(!name || !email || !password){ status.textContent = 'Please fill all fields'; return; }
      status.textContent = 'Creating account...';
      try{
        const res = await auth.createUserWithEmailAndPassword(email, password);
        const user = res.user;
        // Note: Firestore write commented out due to permission rules - deploy updated rules to enable
        await db.collection('admins').doc(user.uid).set({ uid: user.uid, email: user.email, name, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        status.textContent = 'Account created successfully! Redirecting to sign in...';
        setTimeout(() => window.location.href = '/admin/login.html', 2000);
      }catch(err){ console.error(err); status.textContent = 'Signup failed: '+(err.message||err); }
    });
  }

  // forgot password form
  const forgotForm = document.getElementById('forgot-form');
  if(forgotForm){
    forgotForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = document.getElementById('fp-email').value.trim();
      const status = document.getElementById('forgot-status');
      if(!email){ status.textContent = 'Enter your email'; return; }
      status.textContent = 'Sending reset link...';
      try{
        await auth.sendPasswordResetEmail(email);
        status.textContent = 'Reset link sent. Check your inbox.';
      }catch(err){ console.error(err); status.textContent = 'Failed: '+(err.message||err); }
    });
  }

  // dashboard auth guard
  if(window.location.pathname.endsWith('/admin/dashboard.html') ||
     window.location.pathname.endsWith('/admin/blog.html') ||
     window.location.pathname.endsWith('/admin/publications.html') ||
     window.location.pathname.endsWith('/admin/partners.html') ||
     window.location.pathname.endsWith('/admin/volunteers.html') ||
     window.location.pathname.endsWith('/admin/messages.html') ||
     window.location.pathname.endsWith('/admin/donations.html') ||
     window.location.pathname.endsWith('/admin/newsletter.html')){
    onAuthStateChanged(user=>{
      if(!user){ window.location.href = '/admin/login.html'; }
      else if(window.location.pathname.endsWith('/admin/dashboard.html')) { initDashboard(); }
    });
  }

  // sign out
  const so = document.getElementById('signout'); if(so) so.addEventListener('click', ()=>{ signOutUser().then(()=> window.location.href='/admin/login.html'); });

  // update user display after auth
  onAuthStateChanged(async (user)=>{
    if(!user) return;
    const nameEl = document.getElementById('admin-user');
    const emailEl = document.getElementById('admin-email');
    let displayName = user.displayName || user.email || 'Admin';
    let displayEmail = user.email || '';
    // Try to fetch name from Firestore
    try {
      const doc = await db.collection('admins').doc(user.uid).get();
      if (doc.exists) {
        const data = doc.data();
        displayName = data.name || displayName;
      }
    } catch (e) {
      console.warn('Could not fetch admin profile:', e);
    }
    if(nameEl) nameEl.textContent = displayName;
    if(emailEl) emailEl.textContent = displayEmail;
    // wire quick action buttons in hero
    document.querySelectorAll('#admin-hero button[data-section]').forEach(b=> b.addEventListener('click', ()=>{ const sec = b.getAttribute('data-section'); document.querySelectorAll('.admin-section').forEach(s=>s.classList.add('hidden')); const el = document.getElementById('section-'+sec); if(el) el.classList.remove('hidden'); }));
  });

  // Generic guard for all admin pages: redirect to login if not authenticated
  onAuthStateChanged(async (user)=>{
    const adminPaths = ['/admin/dashboard.html','/admin/volunteers.html','/admin/partners.html','/admin/messages.html','/admin/donations.html','/admin/newsletter.html','/admin/blog.html','/admin/publications.html'];
    const current = window.location.pathname;
    if(adminPaths.includes(current)){
      if(!user) window.location.href = '/admin/login.html';
      else{
        // show user in any admin page
        let displayName = user.displayName || user.email || 'Admin';
        let displayEmail = user.email || '';
        // Try to fetch name from Firestore
        try {
          const doc = await db.collection('admins').doc(user.uid).get();
          if (doc.exists) {
            const data = doc.data();
            displayName = data.name || displayName;
          }
        } catch (e) {
          console.warn('Could not fetch admin profile:', e);
        }
        const nameEl = document.getElementById('admin-user'); if(nameEl) nameEl.textContent = displayName;
        const emailEl = document.getElementById('admin-email'); if(emailEl) emailEl.textContent = displayEmail;
      }
    }
  });
});

function initDashboard(){
  // section navigation
  document.querySelectorAll('nav button[data-section]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.admin-section').forEach(s=>s.classList.add('hidden'));
      const id = 'section-' + btn.getAttribute('data-section');
      const el = document.getElementById(id);
      if(el) el.classList.remove('hidden');
    });
  });
  // default show volunteers
  const ev = document.querySelector('button[data-section="volunteers"]'); if(ev) ev.click();
}
