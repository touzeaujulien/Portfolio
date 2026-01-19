// VEILLE TECHNOLOGIQUE - VRAIS FLUX RSS
// Rotation automatique toutes les heures

class VeilleRSS {
    constructor() {
        this.articles = [];
        this.currentFilter = 'all';
        this.lastUpdate = new Date();
        this.nextRotation = Date.now() + 60 * 60 * 1000; // 1 heure
        this.isLoading = false;
        
        // Configuration des flux RSS réels
        this.feeds = {
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
        console.log('🚀 Initialisation du système de veille RSS...');
        
        // Initialiser les éléments DOM
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
        
        // Charger les flux
        await this.loadAllFeeds();
        
        // Configurer les événements
        this.setupEvents();
        
        // Démarrer le timer de rotation
        this.startRotationTimer();
        
        // Démarrer la rotation automatique
        this.startAutoRotation();
        
        console.log('✅ Système RSS prêt avec', this.articles.length, 'articles');
    }
    
    async fetchRSSFeed(source) {
        const feed = this.feeds[source];
        if (!feed) return [];
        
        try {
            // Utiliser un proxy CORS
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return this.parseRSS(data.contents, source);
            
        } catch (error) {
            console.error(`❌ Erreur ${source}:`, error);
            return this.getFallbackArticles(source);
        }
    }
    
    parseRSS(xmlString, source) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');
            const articles = [];
            
            items.forEach((item, index) => {
                if (index >= this.feeds[source].maxArticles) return;
                
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
                        
                        // Calculer "il y a"
                        const now = new Date();
                        const diffMs = now - dateObj;
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        
                        if (diffHours < 1) timeAgo = 'À l\'instant';
                        else if (diffHours < 24) timeAgo = `Il y a ${diffHours}h`;
                        else {
                            const diffDays = Math.floor(diffHours / 24);
                            timeAgo = `Il y a ${diffDays}j`;
                        }
                    } catch (e) {
                        console.warn('Erreur date:', e);
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
                    category: this.getCategory(source),
                    addedAt: new Date()
                });
            });
            
            return articles;
            
        } catch (error) {
            console.error('Erreur parsing RSS:', error);
            return this.getFallbackArticles(source);
        }
    }
    
    getCategory(source) {
        const categories = {
            'it-connect': 'Technique',
            'zeronet': 'High-Tech',
            'cert-fr': 'Sécurité'
        };
        return categories[source] || 'Actualité';
    }
    
    getFallbackArticles(source) {
        // Articles de secours si le RSS échoue
        const fallbacks = {
            'it-connect': [{
                title: "IT-Connect - Actualités techniques",
                excerpt: "Consultez le site pour les dernières actualités systèmes et réseaux.",
                link: "https://www.it-connect.fr",
                date: new Date().toLocaleDateString('fr-FR'),
                timeAgo: "Aujourd'hui",
                category: "Technique"
            }],
            'zeronet': [{
                title: "01net - Actualités high-tech",
                excerpt: "Retrouvez toutes les actualités tech sur 01net.com.",
                link: "https://www.01net.com",
                date: new Date().toLocaleDateString('fr-FR'),
                timeAgo: "Aujourd'hui",
                category: "High-Tech"
            }],
            'cert-fr': [{
                title: "CERT-FR - Alertes sécurité",
                excerpt: "Consultez le CERT-FR pour les dernières alertes de sécurité.",
                link: "https://www.cert.ssi.gouv.fr",
                date: new Date().toLocaleDateString('fr-FR'),
                timeAgo: "Aujourd'hui",
                category: "Sécurité"
            }]
        };
        
        return fallbacks[source] || [];
    }
    
    async loadAllFeeds() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        // Charger tous les flux en parallèle
        const promises = Object.keys(this.feeds).map(source => 
            this.fetchRSSFeed(source)
        );
        
        try {
            const results = await Promise.allSettled(promises);
            
            // Combiner les articles
            this.articles = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const source = Object.keys(this.feeds)[index];
                    const articles = result.value.map(article => ({
                        ...article,
                        source: source
                    }));
                    this.articles.push(...articles);
                }
            });
            
            // Appliquer la rotation (3 articles max par source)
            this.applyRotation();
            
            // Mettre à jour la date
            this.lastUpdate = new Date();
            
        } catch (error) {
            console.error('Erreur générale:', error);
        }
        
        this.isLoading = false;
        this.updateDisplay();
        this.updateStats();
        this.showNotification('Flux RSS actualisés', 'success');
    }
    
    applyRotation() {
        // Garder seulement 3 articles par source (les plus récents)
        const sourceCount = {};
        const rotated = [];
        
        // Trier par date (plus récent d'abord)
        this.articles.sort((a, b) => {
            try {
                return new Date(b.date) - new Date(a.date);
            } catch {
                return 0;
            }
        });
        
        // Filtrer pour garder max 3 par source
        this.articles.forEach(article => {
            if (!sourceCount[article.source]) {
                sourceCount[article.source] = 0;
            }
            
            if (sourceCount[article.source] < 3) {
                rotated.push(article);
                sourceCount[article.source]++;
            }
        });
        
        this.articles = rotated;
    }
    
    showLoading() {
        if (!this.elements.container) return;
        
        this.elements.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-content">
                    <i class="fas fa-sync-alt fa-spin"></i>
                    <p>Connexion aux flux RSS...</p>
                    <small style="color: #94a3b8; margin-top: 1rem; display: block;">
                        <i class="fas fa-satellite"></i> Récupération des dernières actualités
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
                        <button onclick="window.veille.loadAllFeeds()" 
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
            badge.textContent = this.feeds[article.source]?.name || article.source;
            badge.style.background = this.feeds[article.source]?.color || '#6366f1';
            
            // Date
            clone.querySelector('.article-date').textContent = article.timeAgo || article.date;
            
            // Titre
            clone.querySelector('.article-title').textContent = article.title;
            
            // Extrait
            clone.querySelector('.article-excerpt').textContent = article.excerpt;
            
            // Lien
            const link = clone.querySelector('.read-link');
            link.href = article.link;
            
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
            
            if (diffMinutes === 0) this.elements.lastUpdate.textContent = 'à l\'instant';
            else if (diffMinutes === 1) this.elements.lastUpdate.textContent = 'il y a 1 minute';
            else this.elements.lastUpdate.textContent = `il y a ${diffMinutes} minutes`;
        }
        
        // Dernière connexion RSS
        if (this.elements.rssLastConnect) {
            const timeStr = this.lastUpdate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            this.elements.rssLastConnect.textContent = timeStr;
        }
    }
    
    startRotationTimer() {
        const updateTimer = () => {
            if (!this.elements.nextTimer) return;
            
            const now = Date.now();
            const timeLeft = this.nextRotation - now;
            
            if (timeLeft <= 0) {
                this.nextRotation = now + 60 * 60 * 1000;
                this.elements.nextTimer.textContent = '60:00';
                
                // Déclencher la rotation
                if (!this.isLoading) {
                    this.loadAllFeeds();
                }
            } else {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                this.elements.nextTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        };
        
        updateTimer();
        setInterval(updateTimer, 1000);
    }
    
    startAutoRotation() {
        // Rotation automatique toutes les heures
        setInterval(() => {
            if (!this.isLoading) {
                this.loadAllFeeds();
                this.showNotification('Rotation automatique effectuée', 'info');
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
                this.loadAllFeeds();
            });
        }
        
        // Bouton rotation manuelle
        if (this.elements.rotateBtn) {
            this.elements.rotateBtn.addEventListener('click', () => {
                this.loadAllFeeds();
                this.showNotification('Rotation manuelle déclenchée', 'info');
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
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour les boutons actifs
        if (this.elements.filters) {
            this.elements.filters.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
        }
        
        this.updateDisplay();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'veille-notification';
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        const color = type === 'success' ? '#10b981' : '#6366f1';
        
        notification.innerHTML = `
            <i class="fas ${icon}" style="color: ${color};"></i>
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
            border-left: 4px solid ${color};
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 350px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Ajouter l'animation CSS pour les notifications
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
    window.veille = new VeilleRSS();
});
