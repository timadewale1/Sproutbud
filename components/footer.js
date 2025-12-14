class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: #1D3557;
                    color: white;
                    padding: 4rem 2rem;
                }
                
                .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                }
                
                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                    text-decoration: none;
                    margin-bottom: 1rem;
                }

                .footer-logo img { width: 56px; height: 56px; object-fit: contain; }
                
                .footer-about {
                    max-width: 300px;
                }
                
                .footer-about-text {
                    margin-bottom: 1.5rem;
                    color: rgba(255,255,255,0.7);
                }
                
                .footer-social {
                    display: flex;
                    gap: 1rem;
                }
                
                .footer-social-link {
                    color: white;
                    transition: color 0.3s;
                }
                
                .footer-social-link:hover {
                    color: #32A65A;
                }
                
                .footer-heading {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: white;
                }
                
                .footer-links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                .footer-link {
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .footer-link:hover {
                    color: #32A65A;
                }
                
                .footer-newsletter {
                    display: flex;
                    flex-direction: column;
                }
                
                .footer-newsletter-input {
                    padding: 0.75rem;
                    border-radius: 4px;
                    border: none;
                    margin-bottom: 1rem;
                    background-color: rgba(255,255,255,0.1);
                    color: white;
                }
                
                .footer-newsletter-input::placeholder {
                    color: rgba(255,255,255,0.5);
                }
                
                .footer-newsletter-button {
                    padding: 0.75rem;
                    border-radius: 4px;
                    background-color: #32A65A;
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                
                .footer-newsletter-button:hover {
                    background-color: #1E5B3A;
                }
                
                .footer-bottom {
                    max-width: 1200px;
                    margin: 3rem auto 0;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    gap: 1rem;
                    color: rgba(255,255,255,0.5);
                    font-size: 0.875rem;
                }
                
                @media (max-width: 768px) {
                    .footer-container {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <div class="footer-container">
                <div class="footer-about">
                    <a href="/index.html" class="footer-logo">
                        <img src="/media/Logo/IMG_2381.png" alt="SproutBud logo">
                    </a>
                    <p class="footer-about-text">
                        A youth-led African social impact organization working in technology, climate action, clean energy, women empowerment, agriculture, and community development.
                    </p>
                    <div class="footer-social">
                        <a href="#" class="footer-social-link">
                            <i data-feather="twitter"></i>
                        </a>
                        <a href="#" class="footer-social-link">
                            <i data-feather="facebook"></i>
                        </a>
                        <a href="#" class="footer-social-link">
                            <i data-feather="instagram"></i>
                        </a>
                        <a href="#" class="footer-social-link">
                            <i data-feather="linkedin"></i>
                        </a>
                        <a href="#" class="footer-social-link">
                            <i data-feather="youtube"></i>
                        </a>
                    </div>
                </div>
                
                <div>
                    <h3 class="footer-heading">Programs</h3>
                    <div class="footer-links">
                        <a href="/programs/impactcore.html" class="footer-link">ImpactCore</a>
                        <a href="/programs/innovate.html" class="footer-link">Innovate</a>
                        <a href="/programs/greenfront.html" class="footer-link">GreenFront</a>
                        <a href="/programs/women.html" class="footer-link">W.O.M.E.N Initiative</a>
                        <a href="/programs/media.html" class="footer-link">Media & Comms</a>
                    </div>
                </div>
                
                <div>
                    <h3 class="footer-heading">Quick Links</h3>
                    <div class="footer-links">
                        <a href="/about.html" class="footer-link">About Us</a>
                        <a href="/impact.html" class="footer-link">Impact</a>
                        <a href="/team.html" class="footer-link">Our Team</a>
                        <a href="/projects.html" class="footer-link">Projects</a>
                        <a href="/blog.html" class="footer-link">Blog</a>
                        <a href="/publications.html" class="footer-link">Publications</a>
                        <a href="/donate.html" class="donate-btn footer-link">Donate</a>
                        <a href="/contact.html" class="footer-link">Contact</a>
                    </div>
                </div>
                
                <div class="footer-newsletter">
                    <h3 class="footer-heading">Newsletter</h3>
                    <p class="footer-about-text">Subscribe to our newsletter to get updates on our programs and impact.</p>
                    <input type="email" class="footer-newsletter-input" placeholder="Your email address">
                    <button class="footer-newsletter-button">Subscribe</button>
                </div>
            </div>
            
                <div class="footer-bottom">
                <div>© 2025 SproutBud. All rights reserved.</div>
                <div>
                    <a href="/privacy.html" class="footer-link">Privacy Policy</a> | 
                    <a href="/terms.html" class="footer-link">Terms of Service</a>
                </div>
            </div>
            <script>
                (function(){
                    function replaceIcons(root){
                        try{
                            const icons = root.querySelectorAll('i[data-feather]');
                            icons.forEach(el=>{
                                const name = el.getAttribute('data-feather');
                                if(window.feather && window.feather.icons && window.feather.icons[name]){
                                    el.outerHTML = window.feather.icons[name].toSvg({ width: 20, height: 20 });
                                }
                            });
                        }catch(e){ console.warn('icon replacement failed', e); }
                    }
                    const run = ()=>{
                        const el = document.querySelector('custom-footer');
                        if(!el || !el.shadowRoot) return;
                        replaceIcons(el.shadowRoot);
                    };
                    if(window.feather){ run(); }
                    else {
                        const s = document.createElement('script'); s.src = 'https://unpkg.com/feather-icons'; s.onload = run; document.head.appendChild(s);
                    }
                })();
            </script>
        `;
    }
}

customElements.define('custom-footer', CustomFooter);