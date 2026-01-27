// VEILLE TECHNOLOGIQUE - VRAIS FLUX RSS
// Récupération des derniers articles en direct

class VeilleTechnologique {
    constructor() {
        this.articles = [];
        this.currentFilter = 'all';
        this.lastUpdate = new Date();
        this.nextRotation = Date.now() + 60 * 60 * 1000;
        this.isLoading = false;
        
        // Configuration des flux RSS
        this.sources = {
            'it-connect': {
                name: 'IT-Connect',
                website: 'https://www.it-connect.fr',
                color: '#6366f1',
                rssUrl: 'https://www.it-connect.fr/feed/',
                maxArticles: 3
            },
            'zeronet': {
                name: '01net',
                website: 'https://www.01net.com',
                color: '#ef4444',
                rssUrl: 'https://www.01net.com/rss/actualites/',
                maxArticles: 3
            },
            'cert-fr': {
                name: 'CERT-FR',
                website: 'https://www.cert.ssi.gouv.fr',
                color: '#10b981',
                rssUrl: 'https://www.cert.ssi.gouv.fr/feed/',
                maxArticles: 10
            }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initialisation système de veille RSS...');
        
        // Initialiser le DOM
        this.elements = {
            container: document.getElementById('articles-container'),
            totalArticles: document.getElementById('total-articles'),
            nextTimer: document.getElementById('next-timer'),
            lastUpdate: document.getElementById('last-update'),
            rssLastConnect: document.getElementById('rss-last-connect'),
            filters: document.querySelectorAll('.filter-btn'),
            refreshBtn: document.getElementById('refresh-now'),
            rotateBtn: document.getElementById('rotate-now')
        };
        
        // Charger les flux RSS
        await this.loadRSSFeeds();
        
        // Configurer les événements
        this.setupEvents();
        
        // Démarrer les timers
        this.startTimers();
        
        console.log('✅ Système prêt avec', this.articles.length, 'articles');
    }
    
    async loadRSSFeeds() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            // Charger les flux RSS réels
            this.articles = await this.fetchRealRSS();
            
            // Appliquer les limites par source
            this.applyLimits();
            
            // Mettre à jour la date
            this.lastUpdate = new Date();
            
            // Mettre à jour l'affichage
            this.updateDisplay();
            this.updateStats();
            
            const realArticles = this.articles.filter(a => a.isRealRSS).length;
            this.showNotification(`${realArticles} articles chargés depuis les flux RSS`, 'success');
            
        } catch (error) {
            console.error('Erreur:', error);
            this.articles = this.getFallbackArticles();
            this.updateDisplay();
            this.showNotification('Mode démonstration activé', 'warning');
        }
        
        this.isLoading = false;
    }
    
    async fetchRealRSS() {
        const allArticles = [];
        
        for (const [sourceId, source] of Object.entries(this.sources)) {
            try {
                console.log(`📡 Chargement ${source.name}...`);
                
                // Utiliser un proxy CORS
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.rssUrl)}`;
                const response = await fetch(proxyUrl);
                
                if (!response.ok) {
                    console.warn(`❌ ${source.name} échoué:`, response.status);
                    continue;
                }
                
                const data = await response.json();
                
                if (data.contents) {
                    const articles = this.parseRSS(data.contents, sourceId);
                    allArticles.push(...articles);
                    console.log(`✅ ${source.name}: ${articles.length} articles`);
                }
                
            } catch (error) {
                console.warn(`Erreur ${source.name}:`, error.message);
            }
        }
        
        return allArticles;
    }
    
    parseRSS(xmlString, sourceId) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');
            const articles = [];
            const source = this.sources[sourceId];
            
        items.forEach((item, index) => {
            if (index >= source.maxArticles) return;
            
            const title = item.querySelector('title')?.textContent || 'Sans titre';
            const link = item.querySelector('link')?.textContent || source.website;
            const description = item.querySelector('description')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent;
            
            // Nettoyer la description
            const cleanDesc = this.cleanDescription(description);
            
            // Formater la date
            const dateInfo = this.formatDateInfo(pubDate);
            
            articles.push({
                id: `${sourceId}-${Date.now()}-${index}`,
                title: title,
                excerpt: cleanDesc,
                link: link,
                source: sourceId,
                date: dateInfo.dateStr,
                timeAgo: dateInfo.timeAgo,
                category: this.getCategory(sourceId, title),
                addedAt: new Date(),
                isRealRSS: true
            });
        });
        
            return articles;
            
        } catch (error) {
            console.error('Erreur parsing RSS:', error);
            return this.getFallbackForSource(sourceId);
        }
    }
    
    cleanDescription(text) {
        return text
            .replace(/<[^>]*>/g, '')
            .replace(/&[^;]+;/g, '')
            .replace(/\s+/g, ' ')
            .substring(0, 150)
            .trim() + '...';
    }
    
    formatDateInfo(dateString) {
        if (!dateString) return { dateStr: 'Date inconnue', timeAgo: '' };
        
        try {
            const dateObj = new Date(dateString);
            const now = new Date();
            const diffMs = now - dateObj;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            let timeAgo = '';
            if (diffHours < 1) timeAgo = 'À l\'instant';
            else if (diffHours < 24) timeAgo = `Il y a ${diffHours}h`;
            else {
                const diffDays = Math.floor(diffHours / 24);
                timeAgo = `Il y a ${diffDays}j`;
            }
            
            return {
                dateStr: dateObj.toLocaleDateString('fr-FR'),
                timeAgo: timeAgo
            };
            
        } catch {
            return { dateStr: 'Date inconnue', timeAgo: '' };
        }
    }
    
    getCategory(source, title) {
        const categories = {
            'it-connect': ['Windows', 'Linux', 'Réseau', 'Sécurité', 'Cloud', 'DevOps'],
            'zeronet': ['Hardware', 'Réseau', 'Cloud', 'Innovation', 'Mobile', 'Logiciel'],
            'cert-fr': ['Vulnérabilité', 'Alerte', 'Patch', 'Sécurité', 'Avis', 'Bulletin']
        };
        
        const sourceCats = categories[source] || ['Actualité'];
        return sourceCats[Math.floor(Math.random() * sourceCats.length)];
    }
    
    getFallbackForSource(sourceId) {
        // Données de secours spécifiques par source
        const fallbacks = {
            'it-connect': [
                {
                    title: "Windows Server 2025 : déploiement des premières mises à jour critiques",
                    excerpt: "Microsoft publie les premières mises à jour de sécurité pour Windows Server 2025 avec corrections de vulnérabilités importantes.",
                    link: "https://www.it-connect.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Sécurité"
                },
                {
                    title: "Kubernetes 1.31 : gestion avancée des réseaux overlay",
                    excerpt: "Nouvelle version avec support natif des réseaux overlay multi-cloud et optimisations performances.",
                    link: "https://www.it-connect.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Cloud"
                },
                {
                    title: "Guide Ansible : automatisation infrastructure 2026",
                    excerpt: "Tutoriel complet sur les dernières fonctionnalités d'automatisation avec Ansible pour les environnements complexes.",
                    link: "https://www.it-connect.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "DevOps"
                }
            ],
            'zeronet': [
                {
                    title: "Intel Lunar Lake : performances record annoncées",
                    excerpt: "Intel dévoile les benchmarks des processeurs Lunar Lake avec des gains significatifs en efficacité énergétique.",
                    link: "https://www.01net.com",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Hardware"
                },
                {
                    title: "5G Advanced : tests confirmant les débits à 10 Gb/s",
                    excerpt: "Validation des performances de la 5G Advanced ouvrant de nouvelles possibilités pour les applications professionnelles.",
                    link: "https://www.01net.com",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Réseau"
                },
                {
                    title: "Wi-Fi 7 : adoption massive en entreprise confirmée",
                    excerpt: "Étude montrant le déploiement accéléré du Wi-Fi 7 dans les infrastructures réseau d'entreprise.",
                    link: "https://www.01net.com",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Réseau"
                }
            ],
            'cert-fr': [
                {
                    title: "Multiples vulnérabilités critiques dans Apache HTTP Server",
                    excerpt: "Avis urgent concernant plusieurs vulnérabilités permettant l'exécution de code à distance. Correctifs disponibles.",
                    link: "https://www.cert.ssi.gouv.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Vulnérabilité"
                },
                {
                    title: "Campagne d'attaques ciblant les solutions VPN",
                    excerpt: "Nouvelle vague d'attaques exploitant des failles dans les solutions VPN d'entreprise.",
                    link: "https://www.cert.ssi.gouv.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Alerte"
                },
                {
                    title: "Vulnérabilité critique dans VMware vSphere",
                    excerpt: "Patch d'urgence pour une faille permettant l'élévation de privilèges sur les hyperviseurs.",
                    link: "https://www.cert.ssi.gouv.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Patch"
                },
                {
                    title: "Faille zero-day dans les produits Fortinet",
                    excerpt: "Vulnérabilité critique découverte dans les appliances FortiGate nécessitant une mise à jour immédiate.",
                    link: "https://www.cert.ssi.gouv.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Hier",
                    category: "Sécurité"
                },
                {
                    title: "Attaques par ransomware ciblant ESXi",
                    excerpt: "Alerte concernant une campagne d'attaques visant spécifiquement les hyperviseurs VMware ESXi.",
                    link: "https://www.cert.ssi.gouv.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Hier",
                    category: "Alerte"
                }
            ]
        };
        
        const articles = fallbacks[sourceId] || [];
        return articles.map((article, index) => ({
            ...article,
            id: `${sourceId}-fallback-${index}`,
            source: sourceId,
            addedAt: new Date(Date.now() - index * 3600000), // Espacer de 1h
            isRealRSS: false
        }));
    }
    
    getFallbackArticles() {
        // Articles de secours complets
        return [
            ...this.getFallbackForSource('it-connect'),
            ...this.getFallbackForSource('zeronet'),
            ...this.getFallbackForSource('cert-fr')
        ];
    }
    
    applyLimits() {
        // Appliquer les limites par source
        const sourceCount = {};
        const limited = [];
        
        // Trier par date (plus récent d'abord)
        this.articles.sort((a, b) => b.addedAt - a.addedAt);
        
        // Appliquer les limites
        this.articles.forEach(article => {
            if (!sourceCount[article.source]) {
                sourceCount[article.source] = 0;
            }
            
            const max = this.sources[article.source]?.maxArticles || 3;
            if (sourceCount[article.source] < max) {
                limited.push(article);
                sourceCount[article.source]++;
            }
        });
        
        this.articles = limited;
    }
    
    showLoading() {
        if (!this.elements.container) return;
        
        this.elements.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-content">
                    <i class="fas fa-sync-alt fa-spin"></i>
                    <p>Connexion aux flux RSS...</p>
                    <small style="color: #94a3b8; margin-top: 1rem; display: block;">
                        <i class="fas fa-rss"></i> Récupération des derniers articles
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
                        <p>Aucun article disponible</p>
                        <button onclick="window.veille.loadRSSFeeds()" 
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
            badge.textContent = this.sources[article.source]?.name || article.source;
            badge.style.background = this.sources[article.source]?.color || '#6366f1';
            
            if (article.isRealRSS) {
                badge.innerHTML += ' <i class="fas fa-rss" style="margin-left: 5px; font-size: 0.7em;"></i>';
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
        
        // Dernière connexion RSS
        if (this.elements.rssLastConnect) {
            const timeStr = this.lastUpdate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            this.elements.rssLastConnect.textContent = timeStr;
        }
        
        // Compter les articles par source
        const counts = {};
        this.articles.forEach(article => {
            counts[article.source] = (counts[article.source] || 0) + 1;
        });
        
        console.log('📊 Articles par source:', counts);
    }
    
    startTimers() {
        // Timer de rotation
        const updateTimer = () => {
            if (!this.elements.nextTimer) return;
            
            const now = Date.now();
            const timeLeft = this.nextRotation - now;
            
            if (timeLeft <= 0) {
                // Rotation automatique
                this.nextRotation = now + 60 * 60 * 1000;
                this.elements.nextTimer.textContent = '60:00';
                
                if (!this.isLoading) {
                    this.loadRSSFeeds();
                }
            } else {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                this.elements.nextTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        };
        
        updateTimer();
        setInterval(updateTimer, 1000);
        
        // Rotation automatique toutes les heures
        setInterval(() => {
            if (!this.isLoading) {
                this.loadRSSFeeds();
            }
        }, 60 * 60 * 1000);
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
                this.loadRSSFeeds();
            });
        }
        
        // Bouton rotation manuelle
        if (this.elements.rotateBtn) {
            this.elements.rotateBtn.addEventListener('click', () => {
                this.simulateNewArticle();
                this.showNotification('Rotation manuelle - Nouvel article simulé', 'info');
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
    
    simulateNewArticle() {
        // Simuler l'arrivée d'un nouvel article (démonstration)
        const sources = ['it-connect', 'zeronet', 'cert-fr'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const source = this.sources[randomSource];
        
        const newArticle = {
            id: `new-${Date.now()}`,
            title: `[TEST] Nouveau : ${this.getRandomTitle(randomSource)}`,
            excerpt: "Ceci est une simulation d'un nouvel article pour démontrer le système de rotation automatique.",
            link: source.website,
            source: randomSource,
            date: new Date().toLocaleDateString('fr-FR'),
            timeAgo: 'À l\'instant',
            category: this.getCategory(randomSource, ''),
            addedAt: new Date(),
            isRealRSS: false
        };
        
        // Ajouter au début
        this.articles.unshift(newArticle);
        
        // Appliquer les limites (supprime les plus anciens)
        this.applyLimits();
        
        // Mettre à jour l'affichage
        this.updateDisplay();
    }
    
    getRandomTitle(source) {
        const titles = {
            'it-connect': [
                "Guide avancé PowerShell 7",
                "Optimisation des performances Windows Server",
                "Sécurisation des APIs REST"
            ],
            'zeronet': [
                "Nouveaux processeurs AMD annoncés",
                "Innovations dans le stockage NVMe",
                "Tendances cloud computing 2026"
            ],
            'cert-fr': [
                "Nouvelle vulnérabilité critique découverte",
                "Alerte sécurité pour les routeurs Cisco",
                "Patch urgent pour VMware"
            ]
        };
        
        const sourceTitles = titles[source] || ['Actualité technique'];
        return sourceTitles[Math.floor(Math.random() * sourceTitles.length)];
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
`;
document.head.appendChild(style);

// Démarrer le système
document.addEventListener('DOMContentLoaded', () => {
    window.veille = new VeilleTechnologique();
});
