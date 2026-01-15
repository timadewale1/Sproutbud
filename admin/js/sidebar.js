// admin/js/sidebar.js
// Handles mobile sidebar open/close and desktop collapse state
(function(){
  function toggleSidebar(open){
    if(open) document.body.classList.add('sidebar-open'); else document.body.classList.remove('sidebar-open');
  }
  function toggleCollapsed(){
    if(window.innerWidth <= 900){
      // On mobile, close the sidebar
      toggleSidebar(false);
    } else {
      // On desktop, collapse the sidebar
      document.body.classList.toggle('sidebar-collapsed');
    }
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    const t = document.getElementById('sidebar-toggle');
    const tc = document.getElementById('sidebar-collapse');
    if(t) t.addEventListener('click', ()=>{ toggleSidebar(!document.body.classList.contains('sidebar-open')); });
    if(tc) tc.addEventListener('click', ()=>{ toggleCollapsed(); });
    // close sidebar on navigation (mobile)
    document.querySelectorAll('.admin-sidebar a').forEach(a=> a.addEventListener('click', ()=>{ if(window.innerWidth <= 900) toggleSidebar(false); }));
    // restore collapsed preference from session
    try{ if(sessionStorage.getItem('adminSidebarCollapsed')==='1'){ document.body.classList.add('sidebar-collapsed'); } }catch(e){}
    // persist collapsed state
    const obs = new MutationObserver(()=>{ try{ sessionStorage.setItem('adminSidebarCollapsed', document.body.classList.contains('sidebar-collapsed') ? '1':'0'); }catch(e){} });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  });
})();
