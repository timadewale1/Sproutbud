// admin/js/blog.js
function whenDbReady(cb){ const t = setInterval(()=>{ if(window.db){ clearInterval(t); cb(); } }, 150); }

whenDbReady(()=>{
  const form = document.getElementById('post-form');
  const listEl = document.getElementById('posts-list');
  const status = document.getElementById('post-status');

  const postImageInput = document.getElementById('post-image');
const previewBox = document.getElementById('post-image-preview');

if (postImageInput) {
  postImageInput.addEventListener('change', () => {
    const file = postImageInput.files[0];
    if (!file) return;

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);

    previewBox.innerHTML = '';
    previewBox.appendChild(img);
    previewBox.classList.remove('hidden');
  });
}

  async function loadPosts(){
    listEl.innerHTML = 'Loading...';
    try{
      const snap = await db.collection('posts').orderBy('createdAt','desc').get();
      listEl.innerHTML = '';
      snap.forEach(doc=>{
        const d = doc.data();
        const row = document.createElement('div'); row.className='p-3 border rounded';
        row.innerHTML = `<div class="flex justify-between"><div><div class="font-semibold">${d.title||'Untitled'}</div><div class="text-sm text-gray-600">${d.category||''} • ${d.createdAt && d.createdAt.toDate? new Date(d.createdAt.toDate()).toLocaleString() : ''}</div></div><div class="flex gap-2"><button class="btn btn-outline" data-id="${doc.id}" data-act="edit">Edit</button><button class="btn btn-outline" data-id="${doc.id}" data-act="delete">Delete</button></div></div>`;
        listEl.appendChild(row);
      });
      if(listEl.innerHTML==='') listEl.innerHTML = '<div class="text-gray-600">No posts yet.</div>';
    }catch(e){ listEl.innerHTML = '<div class="text-red-600">Failed to load posts: '+e.message+'</div>'; }
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const title = document.getElementById('post-title').value.trim();
      const summary = document.getElementById('post-summary').value.trim();
      const category = document.getElementById('post-category').value.trim();
      const content = document.getElementById('post-content').value.trim();
      const fileInput = document.getElementById('post-image');
      if(!title){ status.textContent = 'Title required'; return; }
      status.textContent = 'Publishing...';
      try{
        const owner = (auth && auth.currentUser) ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null;
        const post = { title, summary, category, content, owner };
        if(fileInput && fileInput.files && fileInput.files[0]){
          const file = fileInput.files[0];
          const path = `posts/${Date.now()}_${file.name}`;
          const url = await uploadFile(path, file, ()=>{});
          post.imageUrl = url; post.imagePath = path;
        }
        const id = await createPost(post);
        status.textContent = 'Published — '+id;
        form.reset();
        setTimeout(()=> status.textContent='',1500);
        loadPosts();
      }catch(err){ status.textContent = 'Error: '+(err.message||err); }
    });
  }

  // delegate edit/delete
  listEl.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.getAttribute('data-id'); const act = btn.getAttribute('data-act');
    if(act==='delete'){
      if(!confirm('Delete post?')) return;
      try{ await db.collection('posts').doc(id).delete(); loadPosts(); }catch(e){ alert('Delete failed: '+e.message); }
    }else if(act==='edit'){
      // load post into form for quick edit (simple replace)
      const doc = await db.collection('posts').doc(id).get(); if(!doc.exists) return alert('Post not found');
      const d = doc.data();
      document.getElementById('post-title').value = d.title||'';
      document.getElementById('post-summary').value = d.summary||'';
      document.getElementById('post-category').value = d.category||'';
      document.getElementById('post-content').value = d.content||'';
      // on submit, update instead of create
      status.textContent = 'Editing post — saving will update existing post.';
      form.onsubmit = async function(ev){ ev.preventDefault(); status.textContent='Saving...'; try{ const title = document.getElementById('post-title').value.trim(); const summary = document.getElementById('post-summary').value.trim(); const category = document.getElementById('post-category').value.trim(); const content = document.getElementById('post-content').value.trim(); await db.collection('posts').doc(id).update({ title, summary, category, content, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }); status.textContent='Updated'; form.reset(); form.onsubmit = null; setTimeout(()=> status.textContent='',1500); loadPosts(); }catch(err){ status.textContent='Error: '+err.message; } };
    }
  });

  loadPosts();
});
