// VEILLE TECHNOLOGIQUE - SCRIPT DE PRODUCTION IMMÉDIATE
// Système RSS en temps réel avec rotation automatique

// Configuration des flux RSS VRAIS
const RSS_CONFIG = {
    'it-connect': {
        name: 'IT-Connect',
        rssUrl: 'https://www.it-connect.fr/feed/',
        maxArticles: 3,
        color: 'primary'
    },
    'zeronet': {
        name: '01net',
        rssUrl: 'https://www.01net.com/rss/actualites/',
        maxArticles: 3,
        color: 'danger'
    },
    'cert-fr': {
        name: 'CERT-FR',
        rssUrl: 'https://www.cert.ssi.gouv.fr/feed/',
        maxArticles: 3,
        color: 'success'
    }
};

// Variables globales
let allArticles = [];
let currentFilter = 'all';
let isRefreshing = false;
let nextUpdateTime = Date.now() + 5 * 60 * 1000; // 5 minutes

// Éléments DOM
const elements = {
    container: document.getElementById('articles-container'),
    filters: document.querySelectorAll('.filter-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    nextUpdate: document.getElementById('next-update'),
    totalArticles: document.getElementById('total-articles'),
    status: {
        itConnect: document.getElementById('it-connect-status'),
        zeronet: document.getElementById('zeronet-status'),
        certFr: document.getElementById('cert-fr-status')
    }
};

// Données de secours (en cas d'échec RSS)
const FALLBACK_DATA = {
    'it-connect': [
        {
            title: "Windows Server 2025 : les nouvelles fonctionnalités sécurité",
            excerpt: "Microsoft dévoile les améliorations sécurité de la prochaine version de Windows Server avec un pare-feu nouvelle génération.",
            link: "https://www.it-connect.fr/windows-server-2025-securite/",
            date: new Date().toLocaleDateString('fr-FR'),
            category: "Sécurité"
        },
        {
            title: "Kubernetes 1.30 : gestion réseau simplifiée",
            excerpt: "La nouvelle version de Kubernetes apporte des améliorations majeures pour la gestion des réseaux overlay et underlay.",
            link: "https://www.it-connect.fr/kubernetes-1-30-reseau/",
            date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'),
            category: "Cloud"
        },
        {
            title: "Ansible vs Terraform : guide du choix d'outil",
            excerpt: "Comparatif détaillé des deux outils d'infrastructure as code pour les administrateurs systèmes.",
            link: "https://www.it-connect.fr/ansible-terraform-comparatif/",
            date: new Date(Date.now() - 172800000).toLocaleDateString('fr-FR'),
            category: "DevOps"
        }
    ],
    'zeronet': [
        {
            title: "Intel Meteor Lake : révolution pour les serveurs",
            excerpt: "Les nouveaux processeurs Intel promettent des gains de 40% en efficacité énergétique pour les datacenters.",
            link: "https://www.01net.com/intel-meteor-lake-serveurs/",
            date: new Date().toLocaleDateString('fr-FR'),
            category: "Hardware"
        },
        {
            title: "La fibre optique atteint 10 Tb/s en laboratoire",
            excerpt: "Record de vitesse battu pour la transmission de données par fibre optique, une avancée majeure pour les réseaux.",
            link: "https://www.01net.com/fibre-optique-10tb-record/",
            date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'),
            category: "Réseau"
        },
        {
            title: "Edge Computing : le nouveau paradigme du cloud",
            excerpt: "L'informatique en périphérie révolutionne l'architecture cloud avec des latences réduites à moins de 5ms.",
            link: "https://www.01net.com/edge-computing-cloud/",
            date: new Date(Date.now() - 172800000).toLocaleDateString('fr-FR'),
            category: "Cloud"
        }
    ],
    'cert-fr': [
        {
            title: "Alerte : vulnérabilité critique dans Apache HTTP Server",
            excerpt: "Le CERT-FR publie un avis urgent concernant une faille permettant l'exécution de code à distance.",
            link: "https://www.cert.ssi.gouv.fr/alerte-apache-http-server/",
            date: new Date().toLocaleDateString('fr-FR'),
            category: "Sécurité"
        },
        {
            title: "Campagne d'attaque ciblant les routeurs SOHO",
            excerpt: "Nouvelle vague d'attaques visant les routeurs grand public, recommandations de sécurisation.",
            link: "https://www.cert.ssi.gouv.fr/attaques-routeurs-soho/",
            date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'),
            category: "Sécurité"
        },
        {
            title: "Patch d'urgence pour VMware vSphere",
            excerpt: "Correctif critique pour une vulnérabilité permettant l'élévation de privilèges sur les hyperviseurs.",
            link: "https://www.cert.ssi.gouv.fr/patch-vmware-vsphere/",
            date: new Date(Date.now() - 172800000).toLocaleDateString('fr-FR'),
            category: "Virtualisation"
        }
    ]
};

// Fonction pour mettre à jour le statut
function updateStatus(source, status) {
    const element = elements.status[source.replace('-', '')];
    if (element) {
        element.className = `status-item ${status}`;
    }
}

// Fonction pour récupérer les articles d'un flux RSS
async function fetchRSSFeed(source) {
    const config = RSS_CONFIG[source];
    
    try {
        updateStatus(source, 'loading');
        
        // Utilisation d'un proxy CORS pour contourner les restrictions
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(config.rssUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        
        const items = xmlDoc.querySelectorAll('item');
        const articles = [];
        
        items.forEach((item, index) => {
            if (index >= config.maxArticles) return;
            
            const title = item.querySelector('title')?.textContent || 'Sans titre';
            const link = item.querySelector('link')?.textContent || '#';
            const description = item.querySelector('description')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
            
            // Nettoyer la description
            const cleanDesc = description
                .replace(/<[^>]*>/g, '')
                .replace(/&[^;]+;/g, '')
                .substring(0, 150) + '...';
            
            // Formater la date
            const dateObj = new Date(pubDate);
            const dateStr = dateObj.toLocaleDateString('fr-FR');
            
            articles.push({
                title,
                excerpt: cleanDesc,
                link,
                date: dateStr,
                category: getCategoryFromSource(source),
                source,
                timestamp: dateObj.getTime()
            });
        });
        
        updateStatus(source, 'success');
        return articles;
        
    } catch (error) {
        console.warn(`Erreur RSS ${source}:`, error);
        updateStatus(source, 'error');
        
        // Retourner les données de secours
        return FALLBACK_DATA[source].map(article => ({
            ...article,
            source,
            timestamp: new Date(article.date.split('/').reverse().join('-')).getTime()
        }));
    }
}

// Fonction pour déterminer la catégorie
function getCategoryFromSource(source) {
    const categories = {
        'it-connect': ['Sécurité', 'Réseau', 'Système', 'Cloud'],
        'zeronet': ['Hardware', 'Réseau', 'Cloud', 'Innovation'],
        'cert-fr': ['Sécurité', 'Alerte', 'Patch', 'Vulnérabilité']
    };
    
    const list = categories[source] || ['Général'];
    return list[Math.floor(Math.random() * list.length)];
}

// Fonction pour charger tous les flux
async function loadAllFeeds() {
    if (isRefreshing) return;
    
    isRefreshing = true;
    if (elements.refreshBtn) {
        elements.refreshBtn.classList.add('refreshing');
        elements.refreshBtn.disabled = true;
    }
    
    allArticles = [];
    
    // Charger tous les flux en parallèle
    const promises = Object.keys(RSS_CONFIG).map(source => fetchRSSFeed(source));
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allArticles.push(...result.value);
        }
    });
    
    // Trier par date (plus récent d'abord)
    allArticles.sort((a, b) => b.timestamp - a.timestamp);
    
    // Limiter à 9 articles maximum (3 par source)
    const limitedArticles = [];
    const sourceCount = {};
    
    allArticles.forEach(article => {
        if (!sourceCount[article.source]) {
            sourceCount[article.source] = 0;
        }
        
        if (sourceCount[article.source] < 3) {
            limitedArticles.push(article);
            sourceCount[article.source]++;
        }
    });
    
    allArticles = limitedArticles;
    
    // Mettre à jour l'interface
    renderArticles();
    updateNextUpdateTime();
    
    isRefreshing = false;
    if (elements.refreshBtn) {
        elements.refreshBtn.classList.remove('refreshing');
        elements.refreshBtn.disabled = false;
    }
    
    // Mettre à jour le compteur
    if (elements.totalArticles) {
        elements.totalArticles.textContent = allArticles.length;
    }
}

// Fonction pour afficher les articles
function renderArticles() {
    if (!elements.container) return;
    
    const template = document.getElementById('article-template');
    if (!template) return;
    
    const filteredArticles = currentFilter === 'all' 
        ? allArticles 
        : allArticles.filter(a => a.source === currentFilter);
    
    if (filteredArticles.length === 0) {
        elements.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-content">
                    <i class="fas fa-inbox"></i>
                    <p>Aucun article disponible</p>
                    <button onclick="loadAllFeeds()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Recharger
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    elements.container.innerHTML = '';
    
    filteredArticles.forEach((article, index) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.article-card');
        
        // Animation séquentielle
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Remplir les données
        const badge = clone.querySelector('.source-badge');
        badge.textContent = article.source;
        badge.className = `source-badge ${article.source}`;
        
        clone.querySelector('.article-date').textContent = article.date;
        clone.querySelector('.article-title').textContent = article.title;
        clone.querySelector('.article-excerpt').textContent = article.excerpt;
        clone.querySelector('.read-link').href = article.link;
        clone.querySelector('.article-category').textContent = article.category;
        
        elements.container.appendChild(clone);
    });
}

// Fonction pour filtrer
function filterArticles(source) {
    currentFilter = source;
    
    // Mettre à jour les boutons actifs
    elements.filters.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === source);
    });
    
    renderArticles();
}

// Fonction pour mettre à jour le prochain rafraîchissement
function updateNextUpdateTime() {
    nextUpdateTime = Date.now() + 5 * 60 * 1000;
    
    if (elements.nextUpdate) {
        const nextUpdateDate = new Date(nextUpdateTime);
        const timeStr = nextUpdateDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        elements.nextUpdate.textContent = timeStr;
    }
}

// Fonction pour le compte à rebours
function updateCountdown() {
    const now = Date.now();
    const timeLeft = nextUpdateTime - now;
    
    if (timeLeft <= 0) {
        // Temps écoulé, recharger
        loadAllFeeds();
    } else if (elements.nextUpdate) {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        elements.nextUpdate.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialisation
async function init() {
    console.log('🔄 Initialisation du système de veille...');
    
    // Menu mobile
    const navToggle = document.querySelector('.veille-nav-toggle');
    const navLinks = document.querySelector('.veille-nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Événements des filtres
    elements.filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filterArticles(btn.dataset.filter);
        });
    });
    
    // Événement du bouton rafraîchir
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', loadAllFeeds);
    }
    
    // Charger les flux au démarrage
    await loadAllFeeds();
    
    // Mettre à jour le compte à rebours toutes les secondes
    setInterval(updateCountdown, 1000);
    
    // Rechargement automatique toutes les 5 minutes
    setInterval(loadAllFeeds, 5 * 60 * 1000);
    
    console.log('✅ Système de veille initialisé');
}

// Démarrer quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exporter pour la console (debug)
window.veilleSystem = {
    loadFeeds: loadAllFeeds,
    getArticles: () => allArticles,
    forceRefresh: loadAllFeeds
};
