// admin/js/donations.js
function whenDbReady(cb){ const t = setInterval(()=>{ if(window.db){ clearInterval(t); cb(); } }, 150); }

whenDbReady(()=>{
  const listEl = document.getElementById('donations-list');
  const refreshBtn = document.getElementById('donations-refresh');
  const exportBtn = document.getElementById('donations-export');

  function toCSV(rows){
    if(!rows || !rows.length) return '';
    const keys = Object.keys(rows[0]);
    const esc = v => '"'+String(v||'').replace(/"/g,'""')+'"';
    const lines = [keys.map(esc).join(',')];
    for(const r of rows) lines.push(keys.map(k=>esc(r[k])).join(','));
    return lines.join('\n');
  }

  async function loadDonations(){
    if(!listEl) return;
    listEl.innerHTML = 'Loading...';
    try{
      const snap = await db.collection('donations').orderBy('createdAt','desc').get();
      const items = [];
      listEl.innerHTML = '';
      snap.forEach(doc=>{
        const d = doc.data();
        items.push({ id: doc.id, name: d.name||'', email: d.email||'', amount: d.amount||'', currency: d.currency||'', method: d.method||'', ref: d.ref||'', createdAt: d.createdAt && d.createdAt.toDate? new Date(d.createdAt.toDate()).toLocaleString() : '' });
        const row = document.createElement('div'); row.className='p-3 border rounded';
        row.innerHTML = `<div class="flex justify-between"><div><div class="font-semibold">${d.name||d.email||'Donor'}</div><div class="text-sm text-gray-600">${d.email||''}</div></div><div class="text-sm text-gray-700">${d.amount||''} ${d.currency||''}</div></div><div class="mt-2 text-sm text-gray-700">Ref: ${d.ref||'—'}</div>`;
        listEl.appendChild(row);
      });
      listEl.dataset.items = JSON.stringify(items);
      if(listEl.innerHTML==='') listEl.innerHTML = '<div class="text-gray-600">No donations yet.</div>';
    }catch(e){ listEl.innerHTML = '<div class="text-red-600">Failed to load donations: '+e.message+'</div>'; }
  }

  if(exportBtn){ exportBtn.addEventListener('click', ()=>{
    const items = listEl.dataset.items ? JSON.parse(listEl.dataset.items) : [];
    const csv = toCSV(items);
    if(!csv) return alert('No donations to export');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'donations.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }); }

  if(refreshBtn) refreshBtn.addEventListener('click', ()=> loadDonations());
  loadDonations();
});
