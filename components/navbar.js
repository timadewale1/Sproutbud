class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }

        nav {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          text-decoration: none;
        }

        .logo-img {
          width: 200px;
          height: 56px;
          object-fit: contain;
        }

        /* Desktop links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          color: #1D3557;
          font-weight: 600;
          text-decoration: none;
          padding: 0.25rem 0.35rem;
        }

        .nav-link:hover {
          color: #32A65A;
        }

        /* Dropdown */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 200px;
          background: white;
          padding: 0.5rem;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(13,38,59,0.12);
          display: none;
          z-index: 50;
        }

        .dropdown-menu a {
          display: block;
          padding: 0.5rem 0.75rem;
          text-decoration: none;
          color: #1D3557;
          border-radius: 6px;
        }

        .dropdown-menu a:hover {
          background: #F6FFF5;
          color: #1E5B3A;
        }

        .nav-item:hover .dropdown-menu {
          display: block;
        }

        /* Donate */
        .donate-btn {
          background: #32A65A;
          color: white;
          padding: 0.5rem 0.85rem;
          border-radius: 999px;
          font-weight: 700;
          text-decoration: none;
        }

        /* Mobile */
        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
        }

        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          padding: 1rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .mobile-menu.open {
          display: block;
        }

        .mobile-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mobile-links a,
        .mobile-links summary {
          color: #1D3557;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }

        /* Mobile details/link tweaks */
        .mobile-projects-list a {
          display: block;
          padding: 0.35rem 0;
          color: #1D3557;
          text-decoration: none;
          font-weight: 600;
        }

        details summary a { color: #1D3557; text-decoration: none; display: inline-block; }
        details[open] .mobile-projects-list { display: block; }

        details {
          padding-left: 0.5rem;
        }

        /* Responsive */
        @media (max-width: 880px) {
          .nav-links {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }
        }

        @media (min-width: 881px) {
          .mobile-menu {
            display: none !important;
          }
        }
      </style>

      <nav>
        <a href="/index.html" class="logo">
          <img src="/Media/Logo/IMG_2380.png" alt="SproutBud" class="logo-img">
        </a>

        <!-- Desktop -->
        <div class="nav-links">
          <div class="nav-item"><a href="/about.html" class="nav-link">About</a></div>
          <div class="nav-item"><a href="/impact.html" class="nav-link">Impact</a></div>

          <div class="nav-item">
            <a href="/programs.html" class="nav-link">Programs</a>
            <div class="dropdown-menu">
              <a href="/programs/impactcore.html">ImpactCore</a>
              <a href="/programs/innovate.html">Innovate</a>
              <a href="/programs/greenfront.html">GreenFront</a>
              <a href="/programs/women.html">W.O.M.E.N Initiative</a>
              <a href="/programs/media.html">Media & Comms</a>
              <a href="/programs/leadership.html">Youth Leadership</a>
            </div>
          </div>

          <div class="nav-item">
            <a href="/projects.html" class="nav-link">Projects</a>
            <div class="dropdown-menu projects-dropdown">
              <a href="/projects.html">View all projects</a>
            </div>
          </div>

          <div class="nav-item"><a href="/blog.html" class="nav-link">Blog</a></div>
          <div class="nav-item"><a href="/publications.html" class="nav-link">Publications</a></div>
          <div class="nav-item"><a href="/gallery.html" class="nav-link">Gallery</a></div>
          <div class="nav-item"><a href="/contact.html" class="nav-link">Contact</a></div>

          <a href="/donate.html" class="donate-btn">Donate</a>
        </div>

        <!-- Mobile Button -->
        <button class="mobile-menu-button" aria-expanded="false">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20"
              stroke="#1D3557"
              stroke-width="2"
              stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Mobile Menu -->
        <div class="mobile-menu" id="mobile-menu">
          <div class="mobile-links">
            <a href="/about.html">About</a>
            <a href="/impact.html">Impact</a>

              <details>
                <summary><a href="/programs.html">Programs</a></summary>
                <a href="/programs/impactcore.html">ImpactCore</a>
                <a href="/programs/innovate.html">Innovate</a>
                <a href="/programs/greenfront.html">GreenFront</a>
                <a href="/programs/women.html">W.O.M.E.N Initiative</a>
              </details>

              <details>
                <summary><a href="/projects.html">Projects</a></summary>
                <div class="mobile-projects-list">Loading...</div>
              </details>

            <a href="/blog.html">Blog</a>
            <a href="/publications.html">Publications</a>
            <a href="/gallery.html">Gallery</a>
            <a href="/donate.html">Donate</a>
            <a href="/contact.html">Contact</a>
          </div>
        </div>
      </nav>
    `;

    /* Mobile toggle logic */
    const btn = this.shadowRoot.querySelector('.mobile-menu-button');
    const menu = this.shadowRoot.querySelector('.mobile-menu');

    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open.toString());
    });

    // Populate projects list dynamically from data file
    (function populateProjects(){
      const desktopContainer = this.shadowRoot.querySelector('.projects-dropdown');
      const mobileContainer = this.shadowRoot.querySelector('.mobile-projects-list');
      fetch('/data/projects-list.json').then(r=>r.json()).then(list=>{
        if(desktopContainer){
          // clear existing except the first link
          desktopContainer.innerHTML = '';
          list.forEach(item=>{
            const a = document.createElement('a');
            a.href = item.url;
            a.textContent = item.title;
            desktopContainer.appendChild(a);
          });
        }
        if(mobileContainer){
          mobileContainer.innerHTML = '';
          list.forEach(item=>{
            const a = document.createElement('a');
            a.href = item.url;
            a.textContent = item.title;
            a.style.display = 'block';
            a.style.padding = '0.35rem 0';
            mobileContainer.appendChild(a);
          });
        }
      }).catch(()=>{
        if(mobileContainer) mobileContainer.textContent = 'Projects unavailable';
      });
    }).call(this);
  }
}

customElements.define('custom-navbar', CustomNavbar);
