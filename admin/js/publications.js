// admin/js/publications.js
function whenDbReady(cb){ const t = setInterval(()=>{ if(window.db){ clearInterval(t); cb(); } }, 150); }

whenDbReady(()=>{
  const form = document.getElementById('publication-form');
  const listEl = document.getElementById('publications-list');
  const status = document.getElementById('pub-status');

  async function loadPubs(){
    listEl.innerHTML = 'Loading...';
    try{
      const snap = await db.collection('publications').orderBy('createdAt','desc').get();
      listEl.innerHTML = '';
      snap.forEach(doc=>{
        const d = doc.data();
        const row = document.createElement('div'); row.className='p-3 border rounded';
        row.innerHTML = `<div class="flex justify-between"><div><div class="font-semibold">${d.title||'Untitled'}</div><div class="text-sm text-gray-600">${d.year||''} • ${d.type||''}</div></div><div class="flex gap-2"><a class="btn btn-outline" href="${d.fileUrl||'#'}" target="_blank">Open</a><button class="btn btn-outline" data-id="${doc.id}" data-act="delete">Delete</button></div></div>`;
        listEl.appendChild(row);
      });
      if(listEl.innerHTML==='') listEl.innerHTML = '<div class="text-gray-600">No publications yet.</div>';
    }catch(e){ listEl.innerHTML = '<div class="text-red-600">Failed to load publications: '+e.message+'</div>'; }
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const title = document.getElementById('pub-title').value.trim();
      const year = document.getElementById('pub-year').value.trim();
      const type = document.getElementById('pub-type').value.trim();
      const coverInput = document.getElementById('pub-cover');
      const fileInput = document.getElementById('pub-file');
      if(!title){ status.textContent = 'Title required'; return; }
      status.textContent = 'Uploading...';
      try{
        const owner = (auth && auth.currentUser) ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null;
        const meta = { title, year, type, owner };
        if(coverInput && coverInput.files && coverInput.files[0]){
          const f = coverInput.files[0];
          const path = `publications/covers/${Date.now()}_${f.name}`;
          const url = await uploadFile(path, f, ()=>{});
          meta.coverUrl = url; meta.coverPath = path;
        }
        if(fileInput && fileInput.files && fileInput.files[0]){
          const pdf = fileInput.files[0];
          const r = await uploadPublicationFile(pdf, ()=>{});
          meta.fileUrl = r.url; meta.filePath = r.path;
        }
        const id = await createPublication(meta);
        status.textContent = 'Uploaded — '+id;
        form.reset(); setTimeout(()=> status.textContent='',1500); loadPubs();
      }catch(err){ status.textContent = 'Error: '+(err.message||err); }
    });
  }

  listEl.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button'); if(!btn) return; const id = btn.getAttribute('data-id'); const act = btn.getAttribute('data-act');
    if(act==='delete'){
      if(!confirm('Delete publication?')) return;
      try{ await db.collection('publications').doc(id).delete(); loadPubs(); }catch(e){ alert('Delete failed: '+e.message); }
    }
  });

  loadPubs();
});
