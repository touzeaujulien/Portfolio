// VEILLE TECHNIQUE - FLUX RSS RÉELS
// Système de rotation automatique avec flux RSS officiels

class VeilleRSS {
    constructor() {
        this.articles = [];
        this.currentFilter = 'all';
        this.nextRotationTime = null;
        this.isLoading = true;
        
        // Configuration des flux RSS officiels
        this.rssFeeds = {
            'it-connect': {
                name: 'IT-Connect',
                url: 'https://www.it-connect.fr/feed/',
                color: '#6366f1',
                maxArticles: 3
            },
            'zeronet': {
                name: '01net',
                url: 'https://www.01net.com/rss/actualites/',
                color: '#ef4444',
                maxArticles: 3
            },
            'cert-fr': {
                name: 'CERT-FR',
                url: 'https://www.cert.ssi.gouv.fr/feed/',
                color: '#10b981',
                maxArticles: 3
            }
        };
        
        this.init();
    }
    
    async init() {
        console.log('📡 Connexion aux flux RSS...');
        
        // Initialiser les éléments DOM
        this.elements = {
            container: document.getElementById('articles-container'),
            totalArticles: document.getElementById('total-articles'),
            nextRotation: document.getElementById('next-rotation'),
            lastUpdateTime: document.getElementById('last-update-time'),
            filters: document.querySelectorAll('.source-filter'),
            refreshBtn: document.getElementById('refresh-articles'),
            rotateBtn: document.getElementById('manual-rotate')
        };
        
        // Charger les articles
        await this.loadRSSFeeds();
        
        // Configurer les événements
        this.setupEvents();
        
        // Démarrer la rotation automatique
        this.startAutoRotation();
        
        // Mettre à jour le compteur
        this.updateRotationTimer();
        
        console.log('✅ Système RSS prêt');
    }
    
    // Fonction pour récupérer un flux RSS avec proxy CORS
    async fetchRSSFeed(source) {
        const config = this.rssFeeds[source];
        
        try {
            // Utiliser un proxy CORS pour contourner les restrictions
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(config.url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return this.parseRSS(data.contents, source);
            
        } catch (error) {
            console.error(`Erreur flux ${source}:`, error);
            return this.getFallbackArticles(source);
        }
    }
    
    // Parser le XML RSS
    parseRSS(xmlString, source) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        const items = xmlDoc.querySelectorAll('item');
        const articles = [];
        
        items.forEach((item, index) => {
            if (index >= this.rssFeeds[source].maxArticles) return;
            
            const title = item.querySelector('title')?.textContent || 'Sans titre';
            const link = item.querySelector('link')?.textContent || '#';
            const description = item.querySelector('description')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent;
            
            // Nettoyer la description
            const cleanDesc = description
                .replace(/<[^>]*>/g, '')
                .replace(/&[^;]+;/g, '')
                .substring(0, 150) + '...';
            
            // Formater la date
            let dateStr = 'Date inconnue';
            let timeAgo = '';
            
            if (pubDate) {
                try {
                    const dateObj = new Date(pubDate);
                    dateStr = dateObj.toLocaleDateString('fr-FR');
                    
                    // Calculer "il y a X temps"
                    const now = new Date();
                    const diffMs = now - dateObj;
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    
                    if (diffHours < 1) {
                        timeAgo = 'À l\'instant';
                    } else if (diffHours < 24) {
                        timeAgo = `Il y a ${diffHours}h`;
                    } else {
                        const diffDays = Math.floor(diffHours / 24);
                        timeAgo = `Il y a ${diffDays}j`;
                    }
                } catch (e) {
                    console.warn('Erreur parsing date:', e);
                }
            }
            
            articles.push({
                id: `${source}-${Date.now()}-${index}`,
                title: title,
                excerpt: cleanDesc,
                link: link,
                source: source,
                date: dateStr,
                timeAgo: timeAgo,
                category: this.getCategoryFromSource(source),
                addedAt: new Date()
            });
        });
        
        return articles;
    }
    
    // Données de secours en cas d'échec
    getFallbackArticles(source) {
        const fallbacks = {
            'it-connect': [
                {
                    title: "Actualités techniques systèmes et réseaux",
                    excerpt: "Consultez IT-Connect.fr pour les dernières actualités techniques francophones.",
                    link: "https://www.it-connect.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Technique"
                }
            ],
            'zeronet': [
                {
                    title: "Actualités high-tech et innovations",
                    excerpt: "Retrouvez toutes les actualités tech sur 01net.com.",
                    link: "https://www.01net.com",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "High-Tech"
                }
            ],
            'cert-fr': [
                {
                    title: "Alertes de sécurité et vulnérabilités",
                    excerpt: "Consultez le CERT-FR pour les dernières alertes de sécurité.",
                    link: "https://www.cert.ssi.gouv.fr",
                    date: new Date().toLocaleDateString('fr-FR'),
                    timeAgo: "Aujourd'hui",
                    category: "Sécurité"
                }
            ]
        };
        
        return fallbacks[source] || [];
    }
    
    getCategoryFromSource(source) {
        const categories = {
            'it-connect': 'Technique',
            'zeronet': 'High-Tech',
            'cert-fr': 'Sécurité'
        };
        return categories[source] || 'Actualité';
    }
    
    // Charger tous les flux RSS
    async loadRSSFeeds() {
        this.isLoading = true;
        this.articles = [];
        
        // Afficher l'état de chargement
        if (this.elements.container) {
            this.elements.container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-content">
                        <i class="fas fa-sync-alt fa-spin"></i>
                        <p>Connexion aux flux RSS en cours...</p>
                        <small style="color: #94a3b8; margin-top: 1rem; display: block;">
                            <i class="fas fa-satellite"></i> Récupération des dernières actualités
                        </small>
                    </div>
                </div>
            `;
        }
        
        // Charger chaque flux en parallèle
        const promises = Object.keys(this.rssFeeds).map(async (source) => {
            const articles = await this.fetchRSSFeed(source);
            return articles.map(article => ({
                ...article,
                source: source
            }));
        });
        
        try {
            const results = await Promise.allSettled(promises);
            
            // Combiner tous les articles
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    this.articles.push(...result.value);
                }
            });
            
            // Trier par date (plus récent d'abord)
            this.articles.sort((a, b) => {
                try {
                    return new Date(b.date) - new Date(a.date);
                } catch {
                    return 0;
                }
            });
            
            // Limiter à 9 articles (3 par source)
            this.applyRotationRules();
            
        } catch (error) {
            console.error('Erreur générale:', error);
        }
        
        this.isLoading = false;
        this.updateDisplay();
        this.updateStats();
        this.showNotification('Flux RSS chargés avec succès', 'success');
    }
    
    // Appliquer les règles de rotation
    applyRotationRules() {
        const maxPerSource = 3;
        const sourceCount = {};
        const rotatedArticles = [];
        
        // Pour chaque article, vérifier si on a atteint la limite par source
        this.articles.forEach(article => {
            if (!sourceCount[article.source]) {
                sourceCount[article.source] = 0;
            }
            
            if (sourceCount[article.source] < maxPerSource) {
                rotatedArticles.push(article);
                sourceCount[article.source]++;
            }
        });
        
        this.articles = rotatedArticles;
    }
    
    // Mettre à jour l'affichage
    updateDisplay() {
        if (!this.elements.container) return;
        
        const filtered = this.getFilteredArticles();
        const template = document.getElementById('article-template');
        
        if (!template) return;
        
        if (filtered.length === 0) {
            this.elements.container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-content">
                        <i class="fas fa-inbox"></i>
                        <p>Aucun article disponible</p>
                        <button onclick="window.veille.loadRSSFeeds()" 
                                style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            Réessayer
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
            
            // Badge source
            const badge = clone.querySelector('.source-badge');
            badge.textContent = this.rssFeeds[article.source]?.name || article.source;
            badge.style.background = this.rssFeeds[article.source]?.color || '#6366f1';
            
            // Date
            clone.querySelector('.article-date').textContent = article.timeAgo || article.date;
            
            // Titre et extrait
            clone.querySelector('.article-title').textContent = article.title;
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
    
    // Rotation automatique
    async rotateArticles() {
        console.log('🔄 Rotation automatique des articles...');
        
        // Recharger les flux
        await this.loadRSSFeeds();
        
        // Notification
        this.showNotification('Rotation effectuée - Articles mis à jour', 'info');
    }
    
    startAutoRotation() {
        // Rotation toutes les heures (3600000 ms)
        setInterval(() => {
            if (!this.isLoading) {
                this.rotateArticles();
            }
        }, 60 * 60 * 1000);
        
        // Définir la prochaine rotation
        this.nextRotationTime = Date.now() + 60 * 60 * 1000;
    }
    
    updateRotationTimer() {
        if (!this.elements.nextRotation) return;
        
        const updateTimer = () => {
            if (!this.nextRotationTime) return;
            
            const now = Date.now();
            const timeLeft = this.nextRotationTime - now;
            
            if (timeLeft <= 0) {
                this.nextRotationTime = now + 60 * 60 * 1000;
                this.elements.nextRotation.textContent = '60:00';
            } else {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                this.elements.nextRotation.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        };
        
        updateTimer();
        setInterval(updateTimer, 1000);
    }
    
    updateStats() {
        if (this.elements.lastUpdateTime) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            this.elements.lastUpdateTime.textContent = timeStr;
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
                this.loadRSSFeeds();
            });
        }
        
        // Bouton rotation manuelle
        if (this.elements.rotateBtn) {
            this.elements.rotateBtn.addEventListener('click', () => {
                this.rotateArticles();
            });
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour les boutons actifs
        if (this.elements.filters) {
            this.elements.filters.forEach(btn => {
                if (btn.dataset.filter === filter) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        this.updateDisplay();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `veille-notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Démarrer le système
document.addEventListener('DOMContentLoaded', () => {
    window.veille = new VeilleRSS();
});
