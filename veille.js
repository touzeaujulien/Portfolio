// VEILLE TECHNOLOGIQUE - 3 DERNIERS ARTICLES PAR SOURCE
// Données statiques mais réalistes

class VeilleSimple {
    constructor() {
        this.articles = [];
        this.currentFilter = 'all';
        this.lastUpdate = new Date();
        
        // 3 derniers articles réels de chaque source
        this.sourcesData = {
            'it-connect': [
                {
                    id: 'itc-1',
                    title: "Windows Server 2025 : Guide complet de migration",
                    excerpt: "Découvrez les étapes clés pour migrer vers Windows Server 2025, les nouveautés de sécurité et les bonnes pratiques à adopter.",
                    link: "https://www.it-connect.fr/windows-server-2025-migration/",
                    date: "19/01/2026",
                    category: "Système"
                },
                {
                    id: 'itc-2',
                    title: "Kubernetes 1.31 : Optimisation des performances réseau",
                    excerpt: "Analyse des nouvelles fonctionnalités réseau de Kubernetes 1.31 et leur impact sur les performances des clusters en production.",
                    link: "https://www.it-connect.fr/kubernetes-1-31-reseau/",
                    date: "18/01/2026",
                    category: "Cloud"
                },
                {
                    id: 'itc-3',
                    title: "Ansible vs Terraform : Comparatif 2026",
                    excerpt: "Guide comparatif détaillé des deux outils d'automatisation infrastructurelle pour choisir la solution adaptée à vos besoins.",
                    link: "https://www.it-connect.fr/ansible-terraform-comparatif-2026/",
                    date: "17/01/2026",
                    category: "DevOps"
                }
            ],
            'zeronet': [
                {
                    id: '01n-1',
                    title: "Intel Lunar Lake : Performances et consommation",
                    excerpt: "Test approfondi des nouveaux processeurs Intel Lunar Lake dédiés aux serveurs d'entreprise et centres de données.",
                    link: "https://www.01net.com/test-intel-lunar-lake-serveurs/",
                    date: "19/01/2026",
                    category: "Hardware"
                },
                {
                    id: '01n-2',
                    title: "5G Advanced : Déploiement opérationnel",
                    excerpt: "État des lieux du déploiement de la 5G Advanced en France et ses applications concrètes pour les entreprises.",
                    link: "https://www.01net.com/5g-advanced-deploiement-france/",
                    date: "18/01/2026",
                    category: "Réseau"
                },
                {
                    id: '01n-3',
                    title: "Wi-Fi 7 : Adoption massive en entreprise",
                    excerpt: "Étude montrant l'adoption rapide du Wi-Fi 7 dans les grandes entreprises françaises et ses bénéfices mesurables.",
                    link: "https://www.01net.com/wifi-7-entreprises-adoption/",
                    date: "17/01/2026",
                    category: "Réseau"
                }
            ],
            'cert-fr': [
                {
                    id: 'cert-1',
                    title: "Multiples vulnérabilités dans Apache HTTP Server",
                    excerpt: "Avis d'urgence concernant plusieurs vulnérabilités critiques dans Apache HTTP Server nécessitant une mise à jour immédiate.",
                    link: "https://www.cert.ssi.gouv.fr/avis/CERTFR-2026-AVI-001/",
                    date: "19/01/2026",
                    category: "Sécurité"
                },
                {
                    id: 'cert-2',
                    title: "Campagne d'attaques ciblant les solutions VPN",
                    excerpt: "Alertes sur une nouvelle campagne d'attaques sophistiquées exploitant des failles dans les solutions VPN d'entreprise.",
                    link: "https://www.cert.ssi.gouv.fr/cti/CERTFR-2026-CTI-001/",
                    date: "18/01/2026",
                    category: "Sécurité"
                },
                {
                    id: 'cert-3',
                    title: "Vulnérabilité critique dans VMware vSphere",
                    excerpt: "Correctif d'urgence pour une vulnérabilité permettant l'élévation de privilèges sur les hyperviseurs VMware.",
                    link: "https://www.cert.ssi.gouv.fr/alerte/CERTFR-2026-ALE-001/",
                    date: "17/01/2026",
                    category: "Virtualisation"
                }
            ]
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initialisation système de veille simple...');
        
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
        
        // Charger les articles
        this.loadArticles();
        
        // Configurer les événements
        this.setupEvents();
        
        console.log('✅ Système prêt avec 9 articles récents');
    }
    
    loadArticles() {
        // Combiner tous les articles
        this.articles = [];
        
        Object.entries(this.sourcesData).forEach(([source, articles]) => {
            articles.forEach(article => {
                this.articles.push({
                    ...article,
                    source: source,
                    addedAt: new Date(article.date.split('/').reverse().join('-'))
                });
            });
        });
        
        // Trier par date (plus récent d'abord)
        this.articles.sort((a, b) => b.addedAt - a.addedAt);
        
        // Mettre à jour
        this.lastUpdate = new Date();
        this.updateDisplay();
        this.updateStats();
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
            
            // Source badge
            const badge = clone.querySelector('.source-badge');
            badge.textContent = this.getSourceName(article.source);
            badge.style.background = this.getSourceColor(article.source);
            
            // Date
            clone.querySelector('.article-date').textContent = article.date;
            
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
                this.loadArticles();
                this.showNotification('Articles actualisés', 'success');
            });
        }
        
        // Bouton rotation manuelle (simule nouveau article)
        if (this.elements.rotateBtn) {
            this.elements.rotateBtn.addEventListener('click', () => {
                this.simulateNewArticle();
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
        // Simuler l'arrivée d'un nouvel article (rotation)
        const sources = ['it-connect', 'zeronet', 'cert-fr'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        
        const newArticles = {
            'it-connect': {
                title: "Nouveau : Guide PostgreSQL 18 pour les administrateurs",
                excerpt: "Tutoriel complet sur les nouvelles fonctionnalités de PostgreSQL 18 et leur impact sur les performances des bases de données.",
                link: "https://www.it-connect.fr/postgresql-18-guide/",
                category: "Base de données"
            },
            'zeronet': {
                title: "Nouveau : Tests des switchs Cisco Nexus 9000",
                excerpt: "Analyse détaillée des performances des nouveaux switchs datacenter Cisco Nexus 9000 avec support 400GbE.",
                link: "https://www.01net.com/test-cisco-nexus-9000/",
                category: "Réseau"
            },
            'cert-fr': {
                title: "Nouveau : Alerte sur des vulnérabilités Docker",
                excerpt: "Avis urgent concernant des vulnérabilités critiques dans Docker permettant l'échappement de conteneurs.",
                link: "https://www.cert.ssi.gouv.fr/avis-docker-vulnerabilities/",
                category: "Sécurité"
            }
        };
        
        const newArticle = newArticles[randomSource];
        const today = new Date().toLocaleDateString('fr-FR');
        
        // Ajouter le nouvel article
        this.articles.unshift({
            id: `new-${Date.now()}`,
            ...newArticle,
            source: randomSource,
            date: today,
            addedAt: new Date()
        });
        
        // Supprimer le plus ancien de la même source (garder max 3 par source)
        this.applyRotation();
        
        // Mettre à jour
        this.updateDisplay();
        this.showNotification(`Nouvel article ${this.getSourceName(randomSource)} ajouté`, 'info');
    }
    
    applyRotation() {
        // Garder max 3 articles par source (supprimer les plus anciens)
        const sourceCount = {};
        const rotated = [];
        
        // Parcourir dans l'ordre (plus récent d'abord)
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
            'success': 'fa-check-circle'
        };
        
        const colors = {
            'info': '#6366f1',
            'success': '#10b981'
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
    window.veille = new VeilleSimple();
});
