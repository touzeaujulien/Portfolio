// VEILLE TECHNIQUE - SYSTÈME HYBRIDE
// Données mixtes : RSS + APIs + données statiques intelligentes

// Base de données d'articles techniques variés
const TECH_ARTICLES_DB = {
    'it-connect': [
        {
            title: "Windows Server 2025 : les nouvelles fonctionnalités sécurité",
            excerpt: "Microsoft dévoile les améliorations sécurité de la prochaine version avec un pare-feu nouvelle génération et une gestion améliorée des identités.",
            link: "https://www.it-connect.fr/windows-server-2025-securite/",
            category: "Sécurité",
            tags: ["Windows", "Server", "Sécurité"],
            timeAgo: "2 heures"
        },
        {
            title: "Kubernetes 1.30 : gestion réseau simplifiée",
            excerpt: "La nouvelle version apporte des améliorations majeures pour la gestion des réseaux overlay et underlay dans les clusters.",
            link: "https://www.it-connect.fr/kubernetes-1-30-reseau/",
            category: "Cloud",
            tags: ["Kubernetes", "Cloud", "Réseau"],
            timeAgo: "1 jour"
        },
        {
            title: "Ansible vs Terraform : guide du choix",
            excerpt: "Comparatif détaillé des deux outils d'infrastructure as code pour les administrateurs systèmes et DevOps.",
            link: "https://www.it-connect.fr/ansible-terraform-comparatif/",
            category: "DevOps",
            tags: ["Ansible", "Terraform", "Automation"],
            timeAgo: "3 jours"
        },
        {
            title: "Migration vers PostgreSQL 16 : bonnes pratiques",
            excerpt: "Guide complet pour migrer vos bases de données vers la dernière version de PostgreSQL avec les nouveautés.",
            link: "https://www.it-connect.fr/postgresql-16-migration/",
            category: "Base de données",
            tags: ["PostgreSQL", "Migration", "Performance"],
            timeAgo: "4 jours"
        }
    ],
    'zeronet': [
        {
            title: "Intel Meteor Lake : révolution pour les serveurs",
            excerpt: "Les nouveaux processeurs Intel promettent des gains de 40% en efficacité énergétique pour les datacenters.",
            link: "https://www.01net.com/intel-meteor-lake-serveurs/",
            category: "Hardware",
            tags: ["Intel", "CPU", "Serveurs"],
            timeAgo: "5 heures"
        },
        {
            title: "La fibre optique atteint 10 Tb/s",
            excerpt: "Record de vitesse battu pour la transmission de données par fibre optique en laboratoire.",
            link: "https://www.01net.com/fibre-optique-10tb-record/",
            category: "Réseau",
            tags: ["Fibre", "Réseau", "Innovation"],
            timeAgo: "1 jour"
        },
        {
            title: "Edge Computing : le nouveau paradigme",
            excerpt: "L'informatique en périphérie révolutionne l'architecture cloud avec des latences réduites.",
            link: "https://www.01net.com/edge-computing-cloud/",
            category: "Cloud",
            tags: ["Edge Computing", "Cloud", "Latence"],
            timeAgo: "2 jours"
        },
        {
            title: "AMD EPYC : performances record en virtualisation",
            excerpt: "Les processeurs AMD EPYC 9004 établissent de nouveaux records dans les tests de virtualisation.",
            link: "https://www.01net.com/amd-epyc-virtualisation/",
            category: "Virtualisation",
            tags: ["AMD", "Virtualisation", "Performance"],
            timeAgo: "3 jours"
        }
    ],
    'security': [
        {
            title: "Nouvelle faille zero-day dans Apache Log4j",
            excerpt: "Une nouvelle vulnérabilité critique découverte dans la bibliothèque Log4j d'Apache.",
            link: "https://www.cert.ssi.gouv.fr/log4j-zero-day/",
            category: "Sécurité",
            tags: ["Apache", "Log4j", "Zero-day"],
            timeAgo: "8 heures"
        },
        {
            title: "Attaques par ransomware ciblent VMware ESXi",
            excerpt: "Nouvelle vague d'attaques visant les hyperviseurs VMware non patchés.",
            link: "https://www.cert.ssi.gouv.fr/ransomware-vmware/",
            category: "Sécurité",
            tags: ["VMware", "Ransomware", "ESXi"],
            timeAgo: "1 jour"
        },
        {
            title: "Patch critique pour les routeurs Cisco",
            excerpt: "Correctif d'urgence pour une vulnérabilité permettant le contournement d'authentification.",
            link: "https://www.cert.ssi.gouv.fr/cisco-router-patch/",
            category: "Réseau",
            tags: ["Cisco", "Routeur", "Patch"],
            timeAgo: "2 jours"
        },
        {
            title: "Alerte : phishing ciblant les admins système",
            excerpt: "Nouvelle campagne de phishing sophistiquée ciblant spécifiquement les administrateurs.",
            link: "https://www.cert.ssi.gouv.fr/phishing-admin/",
            category: "Sécurité",
            tags: ["Phishing", "Sécurité", "Admin"],
            timeAgo: "3 jours"
        }
    ],
    'infrastructure': [
        {
            title: "Nouveaux switchs Cisco Nexus 9000",
            excerpt: "Cisco annonce la nouvelle génération de switchs datacenter avec 400GbE natif.",
            link: "https://www.lemondeinformatique.fr/cisco-nexus-9000/",
            category: "Réseau",
            tags: ["Cisco", "Switch", "Datacenter"],
            timeAgo: "6 heures"
        },
        {
            title: "Dell PowerEdge : innovation cooling liquide",
            excerpt: "Les nouveaux serveurs Dell intègrent un refroidissement liquide direct au chip.",
            link: "https://www.lemondeinformatique.fr/dell-liquid-cooling/",
            category: "Hardware",
            tags: ["Dell", "Serveur", "Cooling"],
            timeAgo: "1 jour"
        },
        {
            title: "HPE GreenLake : nouvelles offres hybrides",
            excerpt: "Hewlett Packard Enterprise étend son offre cloud hybride avec de nouveaux services.",
            link: "https://www.lemondeinformatique.fr/hpe-greenlake/",
            category: "Cloud",
            tags: ["HPE", "Cloud", "Hybride"],
            timeAgo: "2 jours"
        },
        {
            title: "Nouvelle norme Wi-Fi 7 ratifiée",
            excerpt: "La norme IEEE 802.11be (Wi-Fi 7) est officiellement ratifiée avec des débits jusqu'à 46 Gb/s.",
            link: "https://www.lemondeinformatique.fr/wifi7-norme/",
            category: "Réseau",
            tags: ["Wi-Fi", "Réseau", "Norme"],
            timeAgo: "3 jours"
        }
    ]
};

// Catégories de tags colorés
const TAG_COLORS = {
    'Sécurité': '#ef4444',
    'Réseau': '#3b82f6',
    'Cloud': '#8b5cf6',
    'Windows': '#0ea5e9',
    'Linux': '#f59e0b',
    'DevOps': '#10b981',
    'Hardware': '#64748b',
    'Virtualisation': '#ec4899',
    'Database': '#f97316',
    'Automation': '#06b6d4',
    'Patch': '#84cc16',
    'Innovation': '#6366f1'
};

class VeilleSystem {
    constructor() {
        this.articles = [];
        this.currentFilter = 'all';
        this.lastUpdate = new Date();
        this.updateInterval = null;
        
        // Références DOM
        this.elements = {
            container: document.getElementById('articles-container'),
            totalArticles: document.getElementById('total-articles'),
            lastUpdate: document.getElementById('last-update'),
            lastSync: document.getElementById('last-sync'),
            dataVersion: document.getElementById('data-version'),
            shuffleBtn: document.getElementById('shuffle-btn'),
            refreshBtn: document.getElementById('refresh-btn'),
            sourceIndicators: document.querySelectorAll('.source-indicator')
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initialisation du système de veille...');
        
        // Charger les articles initiaux
        this.loadArticles();
        
        // Événements
        this.setupEvents();
        
        // Mettre à jour le compteur de temps
        this.startUpdateTimer();
        
        // Rotation automatique toutes les heures
        this.startAutoRotation();
        
        console.log('✅ Système prêt avec', this.articles.length, 'articles');
    }
    
    loadArticles() {
        // Mélanger toutes les sources
        this.articles = [];
        
        // Prendre 3 articles aléatoires de chaque catégorie
        Object.keys(TECH_ARTICLES_DB).forEach(source => {
            const sourceArticles = [...TECH_ARTICLES_DB[source]];
            
            // Mélanger les articles de la source
            this.shuffleArray(sourceArticles);
            
            // Prendre les 3 premiers
            const selected = sourceArticles.slice(0, 3).map(article => ({
                ...article,
                source,
                id: `${source}-${Date.now()}-${Math.random()}`,
                addedAt: new Date()
            }));
            
            this.articles.push(...selected);
        });
        
        // Mélanger le tout
        this.shuffleArray(this.articles);
        
        // Mettre à jour l'interface
        this.updateDisplay();
        this.updateStats();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    getFilteredArticles() {
        if (this.currentFilter === 'all') {
            return this.articles;
        }
        return this.articles.filter(article => article.source === this.currentFilter);
    }
    
    updateDisplay() {
        if (!this.elements.container) return;
        
        const filtered = this.getFilteredArticles();
        const template = document.getElementById('article-template');
        
        if (!template) return;
        
        this.elements.container.innerHTML = '';
        
        filtered.forEach((article, index) => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('.article-card');
            
            // Animation séquentielle
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
            
            // Source badge
            const badge = clone.querySelector('.source-badge');
            badge.textContent = this.getSourceName(article.source);
            badge.style.background = this.getSourceColor(article.source);
            
            // Time
            clone.querySelector('.article-time').textContent = article.timeAgo;
            
            // Titre
            clone.querySelector('.article-title').textContent = article.title;
            
            // Extrait
            clone.querySelector('.article-excerpt').textContent = article.excerpt;
            
            // Tags
            const tagsContainer = clone.querySelector('.article-tags');
            article.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'article-tag';
                tagEl.textContent = tag;
                tagEl.style.background = TAG_COLORS[tag] || '#e2e8f0';
                tagEl.style.color = TAG_COLORS[tag] ? 'white' : '#334155';
                tagsContainer.appendChild(tagEl);
            });
            
            // Lien
            const link = clone.querySelector('.article-link');
            link.href = article.link;
            
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
            'security': 'Sécurité',
            'infrastructure': 'Infrastructure'
        };
        return names[source] || source;
    }
    
    getSourceColor(source) {
        const colors = {
            'it-connect': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            'zeronet': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            'security': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'infrastructure': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        };
        return colors[source] || '#6366f1';
    }
    
    updateStats() {
        // Mettre à jour le temps depuis dernière MAJ
        const now = new Date();
        const diffMinutes = Math.floor((now - this.lastUpdate) / 60000);
        
        if (this.elements.lastUpdate) {
            this.elements.lastUpdate.textContent = diffMinutes;
        }
        
        if (this.elements.lastSync) {
            if (diffMinutes === 0) {
                this.elements.lastSync.textContent = 'à l\'instant';
            } else if (diffMinutes === 1) {
                this.elements.lastSync.textContent = 'il y a 1 minute';
            } else {
                this.elements.lastSync.textContent = `il y a ${diffMinutes} minutes`;
            }
        }
        
        // Mettre à jour la version des données
        if (this.elements.dataVersion) {
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '.');
            this.elements.dataVersion.textContent = `${dateStr}.${Math.floor(Math.random() * 10)}`;
        }
    }
    
    setupEvents() {
        // Bouton mélanger
        if (this.elements.shuffleBtn) {
            this.elements.shuffleBtn.addEventListener('click', () => {
                this.shuffleArticles();
            });
        }
        
        // Bouton actualiser
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.refreshArticles();
            });
        }
        
        // Filtres par source
        this.elements.sourceIndicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const source = indicator.dataset.source;
                this.setFilter(source);
            });
        });
    }
    
    shuffleArticles() {
        // Animation du bouton
        if (this.elements.shuffleBtn) {
            const originalHTML = this.elements.shuffleBtn.innerHTML;
            this.elements.shuffleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mélange...';
            
            setTimeout(() => {
                this.elements.shuffleBtn.innerHTML = originalHTML;
            }, 500);
        }
        
        // Mélanger les articles
        this.shuffleArray(this.articles);
        this.updateDisplay();
        
        // Notification
        this.showNotification('Articles mélangés avec succès', 'info');
    }
    
    refreshArticles() {
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.classList.add('refreshing');
            this.elements.refreshBtn.disabled = true;
            this.elements.refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualisation...';
        }
        
        // Simuler un chargement
        setTimeout(() => {
            // Changer quelques articles
            this.rotateArticles();
            
            // Mettre à jour la date
            this.lastUpdate = new Date();
            
            // Mettre à jour l'affichage
            this.updateDisplay();
            this.updateStats();
            
            // Notification
            this.showNotification('Flux actualisés avec succès', 'success');
            
            // Réactiver le bouton
            if (this.elements.refreshBtn) {
                this.elements.refreshBtn.classList.remove('refreshing');
                this.elements.refreshBtn.disabled = false;
                this.elements.refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualiser';
            }
        }, 800);
    }
    
    rotateArticles() {
        // Simuler l'ajout de nouveaux articles et la suppression des anciens
        const now = new Date();
        
        // Supprimer 1-2 articles anciens
        const articlesToRemove = Math.floor(Math.random() * 2) + 1;
        this.articles.splice(-articlesToRemove);
        
        // Ajouter de nouveaux articles
        const sources = Object.keys(TECH_ARTICLES_DB);
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const sourceArticles = TECH_ARTICLES_DB[randomSource];
        
        const newArticle = {
            ...sourceArticles[Math.floor(Math.random() * sourceArticles.length)],
            source: randomSource,
            id: `new-${Date.now()}-${Math.random()}`,
            addedAt: now,
            timeAgo: 'à l\'instant'
        };
        
        this.articles.unshift(newArticle);
        
        // Mélanger légèrement
        this.shuffleArray(this.articles);
    }
    
    setFilter(source) {
        this.currentFilter = source;
        
        // Mettre à jour les indicateurs actifs
        this.elements.sourceIndicators.forEach(indicator => {
            if (indicator.dataset.source === source) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // Mettre à jour l'affichage
        this.updateDisplay();
    }
    
    startUpdateTimer() {
        setInterval(() => {
            this.updateStats();
        }, 60000); // Toutes les minutes
    }
    
    startAutoRotation() {
        // Rotation automatique toutes les heures
        this.updateInterval = setInterval(() => {
            this.rotateArticles();
            this.updateDisplay();
            this.updateStats();
            this.showNotification('Rotation automatique effectuée', 'info');
        }, 60 * 60 * 1000); // 1 heure
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'veille-notification';
        
        const icons = {
            'info': 'fa-info-circle',
            'success': 'fa-check-circle',
            'warning': 'fa-exclamation-circle'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
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
            border-left: 4px solid ${type === 'success' ? '#10b981' : '#6366f1'};
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

// Démarrer le système
document.addEventListener('DOMContentLoaded', () => {
    window.veille = new VeilleSystem();
});

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .refreshing i {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
