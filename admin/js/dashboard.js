// admin/js/dashboard.js
function whenDbReady(cb){ const t = setInterval(()=>{ if(window.db){ clearInterval(t); cb(); } }, 150); }

whenDbReady(async ()=>{
  // Load dashboard metrics
  async function loadMetrics(){
    try {
      // Load all metrics in parallel
      const [volunteersSnap, partnersSnap, messagesSnap, donationsSnap, newsletterSnap, postsSnap, publicationsSnap] = await Promise.all([
        db.collection('volunteers').get(),
        db.collection('partners').get(),
        db.collection('messages').get(),
        db.collection('donations').get(),
        db.collection('newsletter_subscribers').get().catch(() => ({ size: 0 })),
        db.collection('posts').get(),
        db.collection('publications').get()
      ]);

      // Update metric counters
      document.getElementById('metric-volunteers').textContent = volunteersSnap.size;
      document.getElementById('metric-partners').textContent = partnersSnap.size;
      document.getElementById('metric-messages').textContent = messagesSnap.size;
      document.getElementById('metric-donations').textContent = donationsSnap.size;
      document.getElementById('metric-subs').textContent = newsletterSnap.size || 0;
      document.getElementById('metric-posts').textContent = postsSnap.size;
      document.getElementById('metric-pubs').textContent = publicationsSnap.size;

      // Load recent activity
      await loadRecentActivity();

    } catch(e) {
      console.error('Failed to load metrics:', e);
    }
  }

  async function loadRecentActivity(){
    const activityEl = document.getElementById('recent-activity');
    if(!activityEl) return;

    try {
      // Get recent items from all collections
      const activities = [];

      // Get recent volunteers
      const volunteersSnap = await db.collection('volunteers').orderBy('createdAt', 'desc').limit(3).get();
      volunteersSnap.forEach(doc => {
        const data = doc.data();
        activities.push({
          type: 'volunteer',
          title: `${data.name || 'New volunteer'} joined`,
          time: data.createdAt,
          icon: 'users'
        });
      });

      // Get recent partners
      const partnersSnap = await db.collection('partners').orderBy('createdAt', 'desc').limit(3).get();
      partnersSnap.forEach(doc => {
        const data = doc.data();
        activities.push({
          type: 'partner',
          title: `${data.name || 'New partner'} joined`,
          time: data.createdAt,
          icon: 'briefcase'
        });
      });

      // Get recent messages
      const messagesSnap = await db.collection('messages').orderBy('createdAt', 'desc').limit(3).get();
      messagesSnap.forEach(doc => {
        const data = doc.data();
        activities.push({
          type: 'message',
          title: `New message from ${data.name || 'Anonymous'}`,
          time: data.createdAt,
          icon: 'mail'
        });
      });

      // Sort by time and take top 5
      activities.sort((a, b) => (b.time?.toMillis?.() || 0) - (a.time?.toMillis?.() || 0));
      const recentActivities = activities.slice(0, 5);

      if(recentActivities.length === 0) {
        activityEl.innerHTML = '<div class="text-gray-600">No recent activity.</div>';
        return;
      }

      activityEl.innerHTML = recentActivities.map(activity => `
        <div class="flex items-center gap-3 p-3 border rounded-lg">
          <i data-feather="${activity.icon}" class="w-5 h-5 text-sprout-green"></i>
          <div class="flex-1">
            <div class="font-medium">${activity.title}</div>
            <div class="text-sm text-gray-600">
              ${activity.time?.toDate ? new Date(activity.time.toDate()).toLocaleString() : 'Recently'}
            </div>
          </div>
        </div>
      `).join('');

      // Re-initialize feather icons
      if(window.feather) window.feather.replace();

    } catch(e) {
      activityEl.innerHTML = '<div class="text-red-600">Failed to load recent activity.</div>';
      console.error('Failed to load recent activity:', e);
    }
  }

  // Load metrics on page load
  loadMetrics();

  // Refresh metrics every 30 seconds
  setInterval(loadMetrics, 30000);
});