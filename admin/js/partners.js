// admin/js/partners.js
function whenDbReady(cb){ const t = setInterval(()=>{ if(window.db){ clearInterval(t); cb(); } }, 150); }

whenDbReady(()=>{
  const form = document.getElementById('partner-form');
  const listEl = document.getElementById('partners-list');
  const status = document.getElementById('p-status');

  async function loadPartners(){
    listEl.innerHTML = 'Loading...';
    try{
      const snap = await db.collection('partners').orderBy('createdAt','desc').get();
      listEl.innerHTML = '';
      snap.forEach(doc=>{
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'card-plain mb-4';
        card.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="font-semibold text-lg">${data.name || '—'}</h4>
              ${data.website ? `<a href="${data.website}" target="_blank" rel="noreferrer" class="text-sprout-green hover:text-sprout-forest text-sm">${data.website}</a>` : ''}
            </div>
            <button class="btn btn-outline text-sm" onclick="deletePartner('${doc.id}')">Delete</button>
          </div>
          ${data.description ? `<p class="text-gray-700 mb-3">${data.description}</p>` : ''}
          ${data.logo ? `<img src="${data.logo}" alt="${data.name} logo" class="w-16 h-16 object-cover rounded-lg border">` : ''}
          <div class="text-xs text-gray-500 mt-2">
            Added: ${data.createdAt?.toDate ? new Date(data.createdAt.toDate()).toLocaleString() : 'Unknown'}
          </div>
        `;
        listEl.appendChild(card);
      });
      if(listEl.innerHTML==='') listEl.innerHTML = '<div class="text-gray-600">No partners yet.</div>';
    }catch(e){ listEl.innerHTML = '<div class="text-red-600">Failed to load partners: '+e.message+'</div>'; }
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('p-name').value.trim();
      const website = document.getElementById('p-website').value.trim();
      const desc = document.getElementById('p-desc').value.trim();
      const logoInput = document.getElementById('p-logo');
      if(!name){ status.textContent = 'Name required'; return; }
      status.textContent = 'Saving...';
      try{
        const partner = { name, website, description: desc };
        // optional logo upload
        if(logoInput && logoInput.files && logoInput.files[0]){
          const file = logoInput.files[0];
          const path = `partners/${Date.now()}_${file.name}`;
          const url = await uploadFile(path, file, ()=>{});
          partner.logo = url; partner.logoPath = path;
        }
        await savePartner(partner);
        status.textContent = 'Saved'; form.reset(); setTimeout(()=> status.textContent='',1500); loadPartners();
      }catch(err){ status.textContent = 'Error: '+(err.message||err); }
    });
  }

  loadPartners();
});

// Delete partner function
async function deletePartner(partnerId) {
  if (!confirm('Are you sure you want to delete this partner?')) return;
  
  try {
    await db.collection('partners').doc(partnerId).delete();
    // Reload the partners list
    const listEl = document.getElementById('partners-list');
    if (listEl) {
      // Re-run the loadPartners function
      const snap = await db.collection('partners').orderBy('createdAt','desc').get();
      listEl.innerHTML = '';
      snap.forEach(doc=>{
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'card-plain mb-4';
        card.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="font-semibold text-lg">${data.name || '—'}</h4>
              ${data.website ? `<a href="${data.website}" target="_blank" rel="noreferrer" class="text-sprout-green hover:text-sprout-forest text-sm">${data.website}</a>` : ''}
            </div>
            <button class="btn btn-outline text-sm" onclick="deletePartner('${doc.id}')">Delete</button>
          </div>
          ${data.description ? `<p class="text-gray-700 mb-3">${data.description}</p>` : ''}
          ${data.logo ? `<img src="${data.logo}" alt="${data.name} logo" class="w-16 h-16 object-cover rounded-lg border">` : ''}
          <div class="text-xs text-gray-500 mt-2">
            Added: ${data.createdAt?.toDate ? new Date(data.createdAt.toDate()).toLocaleString() : 'Unknown'}
          </div>
        `;
        listEl.appendChild(card);
      });
      if(listEl.innerHTML==='') listEl.innerHTML = '<div class="text-gray-600">No partners yet.</div>';
    }
  } catch (error) {
    console.error('Error deleting partner:', error);
    alert('Failed to delete partner. Please try again.');
  }
}
