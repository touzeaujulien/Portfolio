// VEILLE TECHNOLOGIQUE - VRAIS ARTICLES EN DIRECT
// Utilisation de NewsAPI pour les articles réels

class VeilleReelle {
    constructor() {
        this.articles = [];
        this.currentFilter = 'all';
        this.lastUpdate = new Date();
        this.isLoading = false;
        
        // Clé API NewsAPI (gratuite - 100 requêtes/jour)
        // Tu dois créer un compte gratuit sur https://newsapi.org
        this.apiKey = 'b1a3213a26b64bc68ebe2f7a44cad419'; // Clé d'exemple - à remplacer par la tienne
        this.baseUrl = 'https://newsapi.org/v2/everything';
        
        // Configuration des sources pour NewsAPI
        this.sourcesConfig = {
            'it-connect': {
                name: 'IT-Connect',
                color: '#6366f1',
                query: 'IT-Connect OR "administration système" OR "réseau"',
                domains: 'it-connect.fr'
            },
            'technologie': {
                name: 'Technologie',
                color: '#ef4444',
                query: 'technologie OR informatique OR "high tech"',
                domains: '01net.com,lemondeinformatique.fr,zdnet.fr'
            },
            'securite': {
                name: 'Sécurité',
                color: '#10b981',
                query: 'cybersécurité OR "CERT-FR" OR vulnérabilité OR ransomware',
                domains: 'cert.ssi.gouv.fr,cybermalveillance.gouv.fr,ssi.gouv.fr'
            }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initialisation veille avec articles réels...');
        
        // Initialiser le DOM
        this.elements = {
            container: document.getElementById('articles-container'),
            totalArticles: document.getElementById('total-articles'),
            lastUpdate: document.getElementById('last-update'),
            rssLastConnect: document.getElementById('rss-last-connect'),
            filters: document.querySelectorAll('.filter-btn'),
            refreshBtn: document.getElementById('refresh-now'),
            rotateBtn: document.getElementById('rotate-now')
        };
        
        // Charger les vrais articles
        await this.loadRealArticles();
        
        // Configurer les événements
        this.setupEvents();
        
        console.log('✅ Système prêt avec articles réels');
    }
    
    async loadRealArticles() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            // Essayer NewsAPI d'abord
            const newsArticles = await this.fetchFromNewsAPI();
            
            if (newsArticles.length > 0) {
                this.articles = newsArticles;
                console.log(`📰 ${newsArticles.length} articles réels chargés`);
                this.showNotification('Articles réels chargés avec succès', 'success');
            } else {
                // Fallback vers Reddit si NewsAPI échoue
                console.log('⚠️ NewsAPI échoué, tentative Reddit...');
                const redditArticles = await this.fetchFromReddit();
                this.articles = redditArticles;
                this.showNotification('Articles Reddit chargés', 'info');
            }
            
            // Trier par date
            this.articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            
            // Limiter à 9 articles
            this.articles = this.articles.slice(0, 9);
            
        } catch (error) {
            console.error('Erreur chargement articles:', error);
            // Fallback vers données statiques
            this.articles = this.getStaticArticles();
            this.showNotification('Mode démonstration activé', 'warning');
        }
        
        // Mettre à jour
        this.lastUpdate = new Date();
        this.updateDisplay();
        this.updateStats();
        this.isLoading = false;
    }
    
    async fetchFromNewsAPI() {
        const articles = [];
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        try {
            // Recherche articles français récents sur la technologie
            const params = new URLSearchParams({
                q: 'informatique OR technologie OR "système" OR réseau',
                language: 'fr',
                from: weekAgo,
                to: today,
                sortBy: 'publishedAt',
                pageSize: 20,
                apiKey: this.apiKey
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            
            if (!response.ok) {
                throw new Error(`NewsAPI: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                // Transformer les données NewsAPI
                data.articles.forEach((article, index) => {
                    if (!article.title || article.title === '[Removed]') return;
                    
                    // Déterminer la source basée sur le contenu
                    let source = 'technologie';
                    const title = article.title.toLowerCase();
                    const description = (article.description || '').toLowerCase();
                    
                    if (title.includes('sécurité') || title.includes('cyber') || 
                        description.includes('sécurité') || description.includes('vulnérabilité')) {
                        source = 'securite';
                    } else if (title.includes('windows') || title.includes('linux') || 
                              title.includes('server') || title.includes('administration')) {
                        source = 'it-connect';
                    }
                    
                    articles.push({
                        id: `news-${Date.now()}-${index}`,
                        title: article.title,
                        excerpt: article.description || 'Cliquez pour lire l\'article complet',
                        link: article.url,
                        source: source,
                        date: new Date(article.publishedAt).toLocaleDateString('fr-FR'),
                        timeAgo: this.getTimeAgo(new Date(article.publishedAt)),
                        category: this.getCategory(source),
                        addedAt: new Date(),
                        isReal: true
                    });
                });
            }
            
        } catch (error) {
            console.warn('NewsAPI erreur:', error.message);
        }
        
        return articles;
    }
    
    async fetchFromReddit() {
        const articles = [];
        
        try {
            // Récupérer depuis les subreddits techniques
            const subreddits = ['sysadmin', 'networking', 'cybersecurity', 'technology'];
            const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];
            
            const response = await fetch(`https://www.reddit.com/r/${randomSub}/hot.json?limit=10`);
            
            if (!response.ok) {
                throw new Error(`Reddit: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.data && data.data.children) {
                data.data.children.forEach((post, index) => {
                    const postData = post.data;
                    
                    if (!postData.title || postData.title === '[Removed]') return;
                    
                    // Déterminer la source
                    let source = 'technologie';
                    const title = postData.title.toLowerCase();
                    
                    if (randomSub === 'cybersecurity') {
                        source = 'securite';
                    } else if (randomSub === 'sysadmin') {
                        source = 'it-connect';
                    }
                    
                    articles.push({
                        id: `reddit-${Date.now()}-${index}`,
                        title: postData.title,
                        excerpt: postData.selftext ? 
                            postData.selftext.substring(0, 150) + '...' : 
                            'Article Reddit - Cliquez pour lire',
                        link: `https://reddit.com${postData.permalink}`,
                        source: source,
                        date: new Date(postData.created_utc * 1000).toLocaleDateString('fr-FR'),
                        timeAgo: this.getTimeAgo(new Date(postData.created_utc * 1000)),
                        category: this.getCategory(source),
                        addedAt: new Date(),
                        isReal: true
                    });
                });
            }
            
        } catch (error) {
            console.warn('Reddit erreur:', error.message);
        }
        
        return articles;
    }
    
    getStaticArticles() {
        // Données de fallback REALISTES
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
        
        return [
            {
                id: 'real-1',
                title: "Windows Server 2025 : Les nouvelles fonctionnalités de sécurité dévoilées",
                excerpt: "Microsoft annonce les améliorations de sécurité majeures pour Windows Server 2025 avec un focus sur la protection Zero Trust.",
                link: "https://www.microsoft.com/fr-fr/windows-server",
                source: 'it-connect',
                date: today.toLocaleDateString('fr-FR'),
                timeAgo: "Aujourd'hui",
                category: "Sécurité",
                addedAt: today,
                isReal: false
            },
            {
                id: 'real-2',
                title: "Apache publie un patch critique pour une faille zero-day",
                excerpt: "Une vulnérabilité critique dans Apache HTTP Server permet l'exécution de code à distance. Mise à jour urgente recommandée.",
                link: "https://httpd.apache.org/security/vulnerabilities",
                source: 'securite',
                date: today.toLocaleDateString('fr-FR'),
                timeAgo: "Aujourd'hui",
                category: "Sécurité",
                addedAt: today,
                isReal: false
            },
            {
                id: 'real-3',
                title: "Kubernetes 1.31 améliore la gestion des réseaux overlay",
                excerpt: "La nouvelle version apporte des optimisations significatives pour les réseaux dans les environnements cloud hybrides.",
                link: "https://kubernetes.io/blog",
                source: 'it-connect',
                date: yesterday.toLocaleDateString('fr-FR'),
                timeAgo: "Hier",
                category: "Cloud",
                addedAt: yesterday,
                isReal: false
            },
            {
                id: 'real-4',
                title: "Intel dévoile Lunar Lake : 40% plus économe en énergie",
                excerpt: "Les nouveaux processeurs Intel promettent des gains d'efficacité énergétique significatifs pour les datacenters.",
                link: "https://www.intel.com/content/www/fr/fr/products/details/processors.html",
                source: 'technologie',
                date: today.toLocaleDateString('fr-FR'),
                timeAgo: "Aujourd'hui",
                category: "Hardware",
                addedAt: today,
                isReal: false
            },
            {
                id: 'real-5',
                title: "Le CERT-FR alerte sur une campagne d'attaques par ransomware",
                excerpt: "Nouvelle vague d'attaques ciblant les infrastructures VMware. Recommandations de protection publiées.",
                link: "https://www.cert.ssi.gouv.fr",
                source: 'securite',
                date: yesterday.toLocaleDateString('fr-FR'),
                timeAgo: "Hier",
                category: "Sécurité",
                addedAt: yesterday,
                isReal: false
            },
            {
                id: 'real-6',
                title: "Déploiement massif du Wi-Fi 7 dans les entreprises françaises",
                excerpt: "65% des grandes entreprises ont déjà adopté le Wi-Fi 7 selon une étude récente.",
                link: "https://www.arcep.fr/actualites/les-communiques-de-presse/detail/n/wifi7-entreprises.html",
                source: 'technologie',
                date: twoDaysAgo.toLocaleDateString('fr-FR'),
                timeAgo: "Il y a 2 jours",
                category: "Réseau",
                addedAt: twoDaysAgo,
                isReal: false
            },
            {
                id: 'real-7',
                title: "Guide Ansible : Automatisation avancée pour administrateurs",
                excerpt: "Tutoriel complet sur les techniques avancées d'automatisation avec Ansible en environnement de production.",
                link: "https://www.ansible.com/blog",
                source: 'it-connect',
                date: twoDaysAgo.toLocaleDateString('fr-FR'),
                timeAgo: "Il y a 2 jours",
                category: "DevOps",
                addedAt: twoDaysAgo,
                isReal: false
            },
            {
                id: 'real-8',
                title: "5G Advanced : Les premiers tests montrent des débits records",
                excerpt: "Les opérateurs confirment des performances jusqu'à 10 Gb/s en conditions réelles.",
                link: "https://www.arcep.fr/5g",
                source: 'technologie',
                date: yesterday.toLocaleDateString('fr-FR'),
                timeAgo: "Hier",
                category: "Réseau",
                addedAt: yesterday,
                isReal: false
            },
            {
                id: 'real-9',
                title: "Nouvelle faille critique dans Docker nécessitant une mise à jour urgente",
                excerpt: "Vulnérabilité permettant l'échappement de conteneurs. Correctif disponible immédiatement.",
                link: "https://www.docker.com/blog/security",
                source: 'securite',
                date: today.toLocaleDateString('fr-FR'),
                timeAgo: "Aujourd'hui",
                category: "Sécurité",
                addedAt: today,
                isReal: false
            }
        ];
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'À l\'instant';
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        
        const diffDays = Math.floor(diffHours / 24);
        return diffDays === 1 ? 'Hier' : `Il y a ${diffDays}j`;
    }
    
    getCategory(source) {
        const categories = {
            'it-connect': 'Technique',
            'technologie': 'High-Tech',
            'securite': 'Sécurité'
        };
        return categories[source] || 'Actualité';
    }
    
    showLoading() {
        if (!this.elements.container) return;
        
        this.elements.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-content">
                    <i class="fas fa-sync-alt fa-spin"></i>
                    <p>Recherche d'articles réels en cours...</p>
                    <small style="color: #94a3b8; margin-top: 1rem; display: block;">
                        <i class="fas fa-newspaper"></i> Connexion aux sources d'actualités
                    </small>
                </div>
            </div>
        `;
    }
    
    updateDisplay() {
        if (!this.elements.container) return;
        
        const filtered = this.getFilteredArticles();
        const template = document.getElementById('article-template');
        
        if (filtered.length === 0) {
            this.elements.container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-content">
                        <i class="fas fa-inbox"></i>
                        <p>Chargement des articles...</p>
                        <button onclick="window.veille.loadRealArticles()" 
                                style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            Recharger
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        this.elements.container.innerHTML = '';
        
        filtered.forEach((article, index) => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('.article-card');
            
            // Animation
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Source badge
            const badge = clone.querySelector('.source-badge');
            badge.textContent = this.sourcesConfig[article.source]?.name || article.source;
            badge.style.background = this.sourcesConfig[article.source]?.color || '#6366f1';
            
            // Indicateur article réel
            if (article.isReal) {
                badge.innerHTML += ' <i class="fas fa-bolt" style="margin-left: 5px; font-size: 0.7em;"></i>';
            }
            
            // Date
            clone.querySelector('.article-date').textContent = article.timeAgo || article.date;
            
            // Titre
            clone.querySelector('.article-title').textContent = article.title;
            
            // Extrait
            clone.querySelector('.article-excerpt').textContent = article.excerpt;
            
            // Lien
            const link = clone.querySelector('.read-link');
            link.href = article.link;
            link.target = '_blank';
            
            // Catégorie
            clone.querySelector('.article-category').textContent = article.category;
            
            this.elements.container.appendChild(clone);
        });
        
        // Mettre à jour le compteur
        if (this.elements.totalArticles) {
            this.elements.totalArticles.textContent = filtered.length;
        }
    }
    
    getFilteredArticles() {
        if (this.currentFilter === 'all') {
            return this.articles;
        }
        return this.articles.filter(article => article.source === this.currentFilter);
    }
    
    updateStats() {
        // Dernière mise à jour
        if (this.elements.lastUpdate) {
            const now = new Date();
            const diffMinutes = Math.floor((now - this.lastUpdate) / 60000);
            
            if (diffMinutes === 0) {
                this.elements.lastUpdate.textContent = 'à l\'instant';
            } else if (diffMinutes === 1) {
                this.elements.lastUpdate.textContent = 'il y a 1 minute';
            } else {
                this.elements.lastUpdate.textContent = `il y a ${diffMinutes} minutes`;
            }
        }
        
        // Dernière connexion
        if (this.elements.rssLastConnect) {
            const timeStr = this.lastUpdate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            this.elements.rssLastConnect.textContent = timeStr;
        }
    }
    
    setupEvents() {
        // Filtres
        if (this.elements.filters) {
            this.elements.filters.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.dataset.filter;
                    this.setFilter(filter);
                });
            });
        }
        
        // Bouton actualiser
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.loadRealArticles();
            });
        }
        
        // Bouton rotation
        if (this.elements.rotateBtn) {
            this.elements.rotateBtn.addEventListener('click', () => {
                this.rotateArticles();
            });
        }
        
        // Menu mobile
        const navToggle = document.querySelector('.veille-nav-toggle');
        const navLinks = document.querySelector('.veille-nav-links');
        
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    }
    
    async rotateArticles() {
        // Rotation : charger de nouveaux articles
        console.log('🔄 Rotation des articles...');
        
        await this.loadRealArticles();
        this.showNotification('Nouveaux articles chargés', 'info');
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour les boutons
        if (this.elements.filters) {
            this.elements.filters.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
        }
        
        this.updateDisplay();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        
        const icons = {
            'info': 'fa-info-circle',
            'success': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle'
        };
        
        const colors = {
            'info': '#6366f1',
            'success': '#10b981',
            'warning': '#f59e0b'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #334155;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${colors[type] || '#6366f1'};
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 350px;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .fa-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Démarrer le système
document.addEventListener('DOMContentLoaded', () => {
    window.veille = new VeilleReelle();
});
