// admin/js/messages.js
function whenDbReady(cb){ const t = setInterval(()=>{ if(window.db){ clearInterval(t); cb(); } }, 150); }

whenDbReady(()=>{
  const listEl = document.getElementById('messages-list');
  const refreshBtn = document.getElementById('messages-refresh');

  async function loadMessages(){
    if(!listEl) return;
    listEl.innerHTML = 'Loading...';
    try{
      const snap = await db.collection('messages').orderBy('createdAt','desc').get();
      listEl.innerHTML = '';
      snap.forEach(doc=>{
        const data = doc.data();
        const row = document.createElement('div'); row.className='p-3 border rounded';
        row.innerHTML = `<div class="flex justify-between"><div><div class="font-semibold">${data.name||data.email||'Message'}</div><div class="text-sm text-gray-600">${data.email||''} ${data.phone? '• '+data.phone : ''}</div></div><div class="text-sm text-gray-500">${data.createdAt && data.createdAt.toDate? new Date(data.createdAt.toDate()).toLocaleString() : ''}</div></div><div class="mt-2 text-gray-700">${(data.message||'').replace(/\n/g,'<br>')}</div>`;
        const controls = document.createElement('div'); controls.className='mt-3 flex gap-2';
        const mark = document.createElement('button'); mark.className='btn btn-outline'; mark.textContent = data.read ? 'Mark Unread' : 'Mark Read';
        mark.addEventListener('click', async ()=>{
          try{ await db.collection('messages').doc(doc.id).update({ read: !data.read }); loadMessages(); }catch(e){ alert('Update failed: '+e.message); }
        });
        const del = document.createElement('button'); del.className='btn btn-outline'; del.textContent='Delete';
        del.addEventListener('click', async ()=>{ if(!confirm('Delete message?')) return; try{ await db.collection('messages').doc(doc.id).delete(); loadMessages(); }catch(e){ alert('Delete failed: '+e.message); } });
        controls.appendChild(mark); controls.appendChild(del); row.appendChild(controls);
        listEl.appendChild(row);
      });
      if(listEl.innerHTML==='') listEl.innerHTML = '<div class="text-gray-600">No messages.</div>';
    }catch(e){ listEl.innerHTML = '<div class="text-red-600">Failed to load messages: '+e.message+'</div>'; }
  }

  if(refreshBtn) refreshBtn.addEventListener('click', ()=> loadMessages());
  loadMessages();
});
