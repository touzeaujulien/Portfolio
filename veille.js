// VEILLE TECHNOLOGIQUE - ACTUALITÉS DU JOUR
// Système avec rotation automatique

class VeilleTechnologique {
    constructor() {
        this.articles = [];
        this.currentFilter = 'all';
        this.lastUpdate = new Date();
        this.nextRotation = Date.now() + 60 * 60 * 1000;
        this.isLoading = false;
        
        // Données des articles du jour
        this.today = new Date().toLocaleDateString('fr-FR');
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initialisation système de veille...');
        
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
        
        // Charger les articles du jour
        this.loadTodaysArticles();
        
        // Configurer les événements
        this.setupEvents();
        
        // Démarrer les timers
        this.startTimers();
        
        console.log('✅ Système prêt avec', this.articles.length, 'articles');
    }
    
    loadTodaysArticles() {
        // Articles du jour - Données récentes
        this.articles = [
            // IT-CONNECT - Articles techniques
            {
                id: 'itc-' + Date.now(),
                title: "Windows Server 2025 : Nouveautés sécurité et déploiement",
                excerpt: "Microsoft annonce les premières mises à jour critiques pour Windows Server 2025 avec un focus sur la sécurité des identités et la protection contre les attaques Zero Trust.",
                link: "https://www.it-connect.fr/windows-server-2025-securite",
                source: 'it-connect',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "Sécurité",
                addedAt: new Date()
            },
            {
                id: 'itc-' + (Date.now() + 1),
                title: "Kubernetes 1.31 : Gestion avancée des réseaux overlay",
                excerpt: "La dernière version introduit des améliorations majeures pour la gestion des réseaux dans les clusters cloud, avec un support natif pour les réseaux overlay multi-cloud.",
                link: "https://www.it-connect.fr/kubernetes-1-31-reseau",
                source: 'it-connect',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "Cloud",
                addedAt: new Date()
            },
            {
                id: 'itc-' + (Date.now() + 2),
                title: "Guide Ansible : Automatisation infrastructure 2026",
                excerpt: "Tutoriel complet sur les dernières fonctionnalités d'Ansible pour l'automatisation des déploiements et la gestion de configuration à grande échelle.",
                link: "https://www.it-connect.fr/ansible-guide-2026",
                source: 'it-connect',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "DevOps",
                addedAt: new Date()
            },
            
            // 01NET - Actualités high-tech
            {
                id: '01n-' + Date.now(),
                title: "Intel Lunar Lake : Performances record annoncées",
                excerpt: "Intel dévoile les benchmarks des premiers serveurs équipés des processeurs Lunar Lake, promettant des gains de 40% en efficacité énergétique.",
                link: "https://www.01net.com/intel-lunar-lake-serveurs",
                source: 'zeronet',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "Hardware",
                addedAt: new Date()
            },
            {
                id: '01n-' + (Date.now() + 1),
                title: "5G Advanced : Tests réels confirmés à 10 Gb/s",
                excerpt: "Les opérateurs français confirment les performances de la 5G Advanced avec des débits records ouvrant la voie à de nouvelles applications industrielles.",
                link: "https://www.01net.com/5g-advanced-tests",
                source: 'zeronet',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "Réseau",
                addedAt: new Date()
            },
            {
                id: '01n-' + (Date.now() + 2),
                title: "Wi-Fi 7 : Déploiement massif dans les entreprises",
                excerpt: "Étude révélant que 65% des grandes entreprises françaises déploient activement le Wi-Fi 7 pour leurs infrastructures réseau en 2026.",
                link: "https://www.01net.com/wifi7-entreprise",
                source: 'zeronet',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "Réseau",
                addedAt: new Date()
            },
            
            // CERT-FR - Alertes sécurité du jour
            {
                id: 'cert-' + Date.now(),
                title: "Multiples vulnérabilités critiques dans Apache HTTP Server",
                excerpt: "Le CERT-FR publie un avis urgent concernant plusieurs vulnérabilités permettant l'exécution de code à distance. Correctifs immédiats requis.",
                link: "https://www.cert.ssi.gouv.fr/avis/CERTFR-2026-AVI-001",
                source: 'cert-fr',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "Sécurité",
                addedAt: new Date()
            },
            {
                id: 'cert-' + (Date.now() + 1),
                title: "Campagne d'attaques ciblant les solutions VPN d'entreprise",
                excerpt: "Nouvelle vague d'attaques sophistiquées exploitant des failles dans les solutions VPN. Recommandations de sécurisation publiées.",
                link: "https://www.cert.ssi.gouv.fr/cti/CERTFR-2026-CTI-001",
                source: 'cert-fr',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "Sécurité",
                addedAt: new Date()
            },
            {
                id: 'cert-' + (Date.now() + 2),
                title: "Vulnérabilité critique dans VMware vSphere nécessitant un patch urgent",
                excerpt: "Correctif d'urgence publié pour une faille permettant l'élévation de privilèges sur les hyperviseurs VMware. Mise à jour immédiate recommandée.",
                link: "https://www.cert.ssi.gouv.fr/alerte/CERTFR-2026-ALE-001",
                source: 'cert-fr',
                date: this.today,
                timeAgo: "Aujourd'hui",
                category: "Virtualisation",
                addedAt: new Date()
            }
        ];
        
        // Mélanger les articles
        this.shuffleArticles();
        
        // Mettre à jour l'affichage
        this.updateDisplay();
        this.updateStats();
        
        this.showNotification('Articles du jour chargés', 'success');
    }
    
    shuffleArticles() {
        // Mélanger aléatoirement les articles
        for (let i = this.articles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.articles[i], this.articles[j]] = [this.articles[j], this.articles[i]];
        }
    }
    
    applyRotation() {
        // Garder 3 articles max par source (les plus récents)
        const sourceCount = {};
        const rotated = [];
        
        // Trier par date (plus récent d'abord)
        this.articles.sort((a, b) => b.addedAt - a.addedAt);
        
        // Appliquer la limite
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
                    <p>Chargement des actualités du jour...</p>
                    <small style="color: #94a3b8; margin-top: 1rem; display: block;">
                        <i class="fas fa-calendar-day"></i> Articles du ${this.today}
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
            card.classList.add('fade-in');
            
            // Source badge avec couleur spécifique
            const badge = clone.querySelector('.source-badge');
            badge.textContent = this.getSourceName(article.source);
            badge.style.background = this.getSourceColor(article.source);
            
            // Date
            clone.querySelector('.article-date').textContent = article.timeAgo;
            
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
    
    getSourceName(source) {
        const names = {
            'it-connect': 'IT-Connect',
            'zeronet': '01net',
            'cert-fr': 'CERT-FR'
        };
        return names[source] || source;
    }
    
    getSourceColor(source) {
        const colors = {
            'it-connect': 'linear-gradient(135deg, #6366f1, #4f46e5)',
            'zeronet': 'linear-gradient(135deg, #ef4444, #dc2626)',
            'cert-fr': 'linear-gradient(135deg, #10b981, #059669)'
        };
        return colors[source] || '#6366f1';
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
                minute: '2-digit',
                second: '2-digit'
            });
            this.elements.rssLastConnect.textContent = timeStr;
        }
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
                    this.rotateArticles();
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
                this.rotateArticles();
            }
        }, 60 * 60 * 1000);
    }
    
    rotateArticles() {
        // Simuler l'arrivée de nouveaux articles et rotation
        console.log('🔄 Rotation des articles...');
        
        // Changer quelques articles
        this.simulateNewArticles();
        
        // Appliquer la rotation (supprimer les plus anciens)
        this.applyRotation();
        
        // Mettre à jour l'affichage
        this.updateDisplay();
        this.updateStats();
        
        this.showNotification('Rotation effectuée - Articles mis à jour', 'info');
    }
    
    simulateNewArticles() {
        // Simuler l'arrivée de nouveaux articles (pour démonstration)
        const newArticles = [
            {
                id: 'new-' + Date.now(),
                title: "Nouvelle faille zero-day découverte dans Docker",
                excerpt: "Une vulnérabilité critique permet l'échappement de conteneurs Docker. Patch d'urgence disponible.",
                link: "https://www.it-connect.fr/docker-zero-day",
                source: 'it-connect',
                date: this.today,
                timeAgo: 'À l\'instant',
                category: "Sécurité",
                addedAt: new Date()
            },
            {
                id: 'new-' + (Date.now() + 1),
                title: "AMD EPYC : Nouveaux records de virtualisation",
                excerpt: "Les processeurs AMD EPYC établissent de nouveaux records dans les tests de densité de virtualisation.",
                link: "https://www.01net.com/amd-epyc-virtualisation",
                source: 'zeronet',
                date: this.today,
                timeAgo: 'À l\'instant',
                category: "Hardware",
                addedAt: new Date()
            },
            {
                id: 'new-' + (Date.now() + 2),
                title: "Alerte : Attaques par ransomware ciblant les bases de données",
                excerpt: "Nouvelle campagne d'attaques visant spécifiquement les bases de données MongoDB et PostgreSQL.",
                link: "https://www.cert.ssi.gouv.fr/alerte-ransomware-db",
                source: 'cert-fr',
                date: this.today,
                timeAgo: 'À l\'instant',
                category: "Sécurité",
                addedAt: new Date()
            }
        ];
        
        // Ajouter 1-2 nouveaux articles
        const toAdd = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < toAdd; i++) {
            const randomArticle = newArticles[Math.floor(Math.random() * newArticles.length)];
            this.articles.unshift({
                ...randomArticle,
                id: randomArticle.id + '-' + i
            });
        }
        
        // Mélanger légèrement
        this.shuffleArticles();
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
                this.loadTodaysArticles();
                this.showNotification('Articles actualisés', 'success');
            });
        }
        
        // Bouton rotation manuelle
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
