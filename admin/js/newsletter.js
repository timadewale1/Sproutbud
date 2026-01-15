// admin/js/newsletter.js
function whenDbReady(cb){ const t = setInterval(()=>{ if(window.db){ clearInterval(t); cb(); } }, 150); }

whenDbReady(()=>{
  const listEl = document.getElementById('newsletter-list');
  const refreshBtn = document.getElementById('newsletter-refresh');
  const exportBtn = document.getElementById('newsletter-export');

  function toCSV(rows){
    if(!rows || !rows.length) return '';
    const keys = Object.keys(rows[0]);
    const esc = v => '"'+String(v||'').replace(/"/g,'""')+'"';
    const lines = [keys.map(esc).join(',')];
    for(const r of rows) lines.push(keys.map(k=>esc(r[k])).join(','));
    return lines.join('\n');
  }

  async function loadSubscribers(){
    if(!listEl) return;
    listEl.innerHTML = 'Loading...';
    try{
      // try common collection names
      let snap = await db.collection('newsletter_subscribers').orderBy('createdAt','desc').get().catch(()=>null);
      if(!snap || snap.empty) snap = await db.collection('newsletter').orderBy('createdAt','desc').get().catch(()=>null);
      const items = [];
      listEl.innerHTML = '';
      if(snap && !snap.empty){
        snap.forEach(doc=>{
          const d = doc.data();
          items.push({ id: doc.id, email: d.email||d.address||'', name: d.name||'', createdAt: d.createdAt && d.createdAt.toDate? new Date(d.createdAt.toDate()).toLocaleString() : '' });
          const row = document.createElement('div'); row.className='p-3 border rounded';
          row.innerHTML = `<div class="flex justify-between"><div><div class="font-semibold">${d.email||d.address||'Subscriber'}</div><div class="text-sm text-gray-600">${d.name||''}</div></div><div class="text-sm text-gray-500">${d.createdAt && d.createdAt.toDate? new Date(d.createdAt.toDate()).toLocaleString() : ''}</div></div>`;
          listEl.appendChild(row);
        });
      }
      listEl.dataset.items = JSON.stringify(items);
      if(listEl.innerHTML==='') listEl.innerHTML = '<div class="text-gray-600">No subscribers yet.</div>';
    }catch(e){ listEl.innerHTML = '<div class="text-red-600">Failed to load subscribers: '+e.message+'</div>'; }
  }

  if(exportBtn){ exportBtn.addEventListener('click', ()=>{
    const items = listEl.dataset.items ? JSON.parse(listEl.dataset.items) : [];
    const csv = toCSV(items);
    if(!csv) return alert('No subscribers to export');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'newsletter_subscribers.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }); }

  if(refreshBtn) refreshBtn.addEventListener('click', ()=> loadSubscribers());
  loadSubscribers();
});
