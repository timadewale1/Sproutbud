// admin/js/volunteers.js
// CRUD for volunteers using Firestore helpers (saveVolunteer is available in firebase.js)

function whenDbReady(cb){
  const t = setInterval(()=>{ if(window.db){ clearInterval(t); cb(); } }, 150);
}

whenDbReady(()=>{
  const form = document.getElementById('volunteer-form');
  const listEl = document.getElementById('volunteers-list');
  const status = document.getElementById('v-status');

  async function loadVolunteers(){
    listEl.innerHTML = 'Loading...';
    try{
      const snap = await db.collection('volunteers').orderBy('createdAt','desc').get();
      listEl.innerHTML = '';
      snap.forEach(doc=>{
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'card-plain mb-4';
        card.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="font-semibold text-lg">${data.name || '—'}</h4>
              ${data.email ? `<p class="text-gray-700 text-sm">${data.email}</p>` : ''}
              ${data.phone ? `<p class="text-gray-700 text-sm">${data.phone}</p>` : ''}
              ${data.location ? `<p class="text-gray-700 text-sm">📍 ${data.location}</p>` : ''}
              ${data.skills ? `<p class="text-gray-700 text-sm">🎯 ${data.skills}</p>` : ''}
            </div>
            <button class="btn btn-outline text-sm" onclick="deleteVolunteer('${doc.id}')">Delete</button>
          </div>
          ${data.message ? `<p class="text-gray-700 mb-3">${data.message}</p>` : ''}
          <div class="text-xs text-gray-500 mt-2">
            Joined: ${data.createdAt?.toDate ? new Date(data.createdAt.toDate()).toLocaleString() : 'Unknown'}
          </div>
        `;
        listEl.appendChild(card);
      });
      if(listEl.innerHTML==='') listEl.innerHTML = '<div class="text-gray-600">No volunteers yet.</div>';
    }catch(e){ listEl.innerHTML = '<div class="text-red-600">Failed to load volunteers: '+e.message+'</div>'; }
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('v-name').value.trim();
      const email = document.getElementById('v-email').value.trim();
      const phone = document.getElementById('v-phone').value.trim();
      if(!name){ status.textContent = 'Name required'; return; }
      status.textContent = 'Saving...';
      try{
        await saveVolunteer({ name, email, phone });
        status.textContent = 'Saved';
        form.reset();
        setTimeout(()=> status.textContent='', 1500);
        loadVolunteers();
      } catch(err){ status.textContent = 'Error: '+(err.message||err); }
    });
  }

  // Global function for delete button
  window.deleteVolunteer = async function(id) {
    if(!confirm('Delete volunteer?')) return;
    try{ await db.collection('volunteers').doc(id).delete(); loadVolunteers(); }catch(e){ alert('Delete failed: '+e.message); }
  };

  loadVolunteers();
});
