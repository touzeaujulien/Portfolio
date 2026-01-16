// Configuration des flux RSS
const RSS_FEEDS = {
    'it-connect': {
        name: 'IT-Connect',
        url: 'https://www.it-connect.fr/feed/',
        color: 'primary',
        maxArticles: 3,
        proxyUrl: 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.it-connect.fr/feed/')
    },
    'zeronet': {
        name: '01net',
        url: 'https://www.01net.com/rss/actualites/',
        color: 'danger',
        maxArticles: 3,
        proxyUrl: 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.01net.com/rss/actualites/')
    },
    'cert-fr': {
        name: 'CERT-FR',
        url: 'https://www.cert.ssi.gouv.fr/feed/',
        color: 'success',
        maxArticles: 3,
        proxyUrl: 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.cert.ssi.gouv.fr/feed/')
    }
};

// Éléments DOM
const articlesContainer = document.getElementById('articles-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const refreshButton = document.getElementById('refresh-btn');
const updateTimeElement = document.getElementById('update-time');
const totalArticlesElement = document.getElementById('total-articles');
const navToggle = document.querySelector('.veille-nav-toggle');
const navLinks = document.querySelector('.veille-nav-links');

// Éléments de statut
const statusElements = {
    'it-connect': document.getElementById('it-connect-status'),
    'zeronet': document.getElementById('zeronet-status'),
    'cert-fr': document.getElementById('cert-fr-status')
};

// État de l'application
let currentFilter = 'all';
let articlesData = [];
let isLoading = false;

// Données de secours au cas où les flux RSS échouent
const FALLBACK_ARTICLES = {
    'it-connect': [
        {
            id: 'it-connect-1',
            title: "Microsoft dévoile une faille critique dans Windows Server",
            excerpt: "Une nouvelle vulnérabilité permet l'exécution de code à distance sans authentification sur les versions 2019 et 2022.",
            source: 'it-connect',
            date: new Date().toLocaleDateString('fr-FR'),
            category: 'Sécurité',
            link: '#',
            timestamp: Date.now()
        },
        {
            id: 'it-connect-2',
            title: "Linux 6.8 : les améliorations réseau qui changent tout",
            excerpt: "Le noyau Linux 6.8 apporte des optimisations TCP/IP majeures et un support étendu des cartes réseau 100GbE.",
            source: 'it-connect',
            date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'),
            category: 'Système',
            link: '#',
            timestamp: Date.now() - 86400000
        },
        {
            id: 'it-connect-3',
            title: "Ansible 2.16 : automation réseau repensée",
            excerpt: "La nouvelle version du framework d'automatisation introduit des modules spécifiques pour les équipements Cisco et Juniper.",
            source: 'it-connect',
            date: new Date(Date.now() - 172800000).toLocaleDateString('fr-FR'),
            category: 'DevOps',
            link: '#',
            timestamp: Date.now() - 172800000
        }
    ],
    'zeronet': [
        {
            id: 'zeronet-1',
            title: "Les datacenters français passent au refroidissement liquide",
            excerpt: "Face à la montée en puissance des GPU pour l'IA, les infrastructures adoptent massivement le watercooling.",
            source: 'zeronet',
            date: new Date().toLocaleDateString('fr-FR'),
            category: 'Infrastructure',
            link: '#',
            timestamp: Date.now()
        },
        {
            id: 'zeronet-2',
            title: "La 5G privée arrive dans les entreprises françaises",
            excerpt: "Orange et Nokia déploient les premiers réseaux 5G dédiés pour l'industrie 4.0 et les campus connectés.",
            source: 'zeronet',
            date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'),
            category: 'Réseau',
            link: '#',
            timestamp: Date.now() - 86400000
        },
        {
            id: 'zeronet-3',
            title: "Intel dévoile ses nouveaux processeurs pour serveurs",
            excerpt: "La gamme Xeon Scalable de 4e génération promet des gains de performances de 50% pour le cloud computing.",
            source: 'zeronet',
            date: new Date(Date.now() - 172800000).toLocaleDateString('fr-FR'),
            category: 'Hardware',
            link: '#',
            timestamp: Date.now() - 172800000
        }
    ],
    'cert-fr': [
        {
            id: 'cert-fr-1',
            title: "Apache ActiveMQ : faille zero-day exploitée activement",
            excerpt: "CERT-FR alerte sur une vulnérabilité critique dans le broker de messages. Correctif urgent disponible.",
            source: 'cert-fr',
            date: new Date().toLocaleDateString('fr-FR'),
            category: 'Sécurité',
            link: '#',
            timestamp: Date.now()
        },
        {
            id: 'cert-fr-2',
            title: "Attaques par ransomware ciblant VMware ESXi",
            excerpt: "Avis urgent concernant une campagne d'attaques visant les hyperviseurs non patchés.",
            source: 'cert-fr',
            date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'),
            category: 'Sécurité',
            link: '#',
            timestamp: Date.now() - 86400000
        },
        {
            id: 'cert-fr-3',
            title: "Faille critique dans les firewalls Fortinet",
            excerpt: "Une vulnérabilité permet de contourner l'authentification sur les appliances FortiGate. Patch disponible.",
            source: 'cert-fr',
            date: new Date(Date.now() - 172800000).toLocaleDateString('fr-FR'),
            category: 'Sécurité',
            link: '#',
            timestamp: Date.now() - 172800000
        }
    ]
};

// Fonction pour mettre à jour le statut d'une source
function updateStatus(source, status, message = '') {
    const element = statusElements[source];
    if (!element) return;
    
    element.className = 'status-item ' + status;
    if (message) {
        element.title = message;
    }
}

// Fonction pour simuler un nouvel article RSS (pour démonstration)
function simulateNewRSSArticle() {
    const newArticle = {
        id: `zeronet-sim-${Date.now()}`,
        title: "BREAKING : Nouvelle faille critique dans les routeurs Cisco série ISR 4000",
        excerpt: "Les chercheurs en sécurité viennent d'identifier une vulnérabilité zero-day affectant les routeurs Cisco série ISR 4000. Patch d'urgence attendu dans les 24h.",
        source: 'zeronet',
        date: new Date().toLocaleDateString('fr-FR'),
        category: 'Sécurité',
        link: '#',
        timestamp: Date.now()
    };
    
    // Ajouter au début (car plus récent)
    articlesData.unshift(newArticle);
    
    // Garder max 3 articles par source
    const sourceArticles = {};
    const filtered = [];
    
    articlesData.forEach(article => {
        if (!sourceArticles[article.source]) {
            sourceArticles[article.source] = 0;
        }
        
        if (sourceArticles[article.source] < 3) {
            filtered.push(article);
            sourceArticles[article.source]++;
        }
    });
    
    articlesData = filtered;
    
    // Réafficher
    renderArticles();
    
    // Notification
    showNotification(`Nouvel article ${newArticle.source} ajouté !`, 'success');
}

// Fonction pour récupérer les flux RSS
async function fetchRSSFeeds() {
    articlesData = [];
    isLoading = true;
    
    // Mettre tous les statuts en loading
    Object.keys(RSS_FEEDS).forEach(source => {
        updateStatus(source, 'loading');
    });
    
    // Pour l'exemple, on utilise les données de secours
    // En production, vous décommenteriez le code de fetch
    
    Object.entries(FALLBACK_ARTICLES).forEach(([source, articles]) => {
        articlesData.push(...articles);
        updateStatus(source, 'success', `${articles.length} articles chargés`);
    });
    
    // CODE POUR LES VRAIS FLUX RSS (à décommenter en production)
    /*
    try {
        const fetchPromises = Object.entries(RSS_FEEDS).map(async ([source, config]) => {
            try {
                const response = await fetch(config.proxyUrl);
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const data = await response.json();
                
                if (data.contents) {
                    // Parser le RSS ici
                    const articles = parseRSS(data.contents, source);
                    articlesData.push(...articles.slice(0, config.maxArticles));
                    updateStatus(source, 'success', `${articles.length} articles`);
                }
            } catch (error) {
                console.error(`Erreur ${source}:`, error);
                updateStatus(source, 'error', 'Échec du chargement');
                
                // Fallback
                articlesData.push(...FALLBACK_ARTICLES[source]);
                updateStatus(source, 'success', 'Données de démonstration');
            }
        });
        
        await Promise.allSettled(fetchPromises);
    } catch (error) {
        console.error('Erreur générale:', error);
    }
    */
    
    // Trier par date (plus récent d'abord)
    articlesData.sort((a, b) => b.timestamp - a.timestamp);
    
    isLoading = false;
    updateTime();
    renderArticles();
}

// Fonction pour mettre à jour l'heure
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    if (updateTimeElement) {
        updateTimeElement.textContent = timeString;
    }
}

// Fonction pour afficher les articles
function renderArticles() {
    if (isLoading) {
        articlesContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-content">
                    <i class="fas fa-sync-alt fa-spin"></i>
                    <p>Chargement des flux RSS en cours...</p>
                </div>
            </div>
        `;
        return;
    }
    
    let filteredArticles = [];
    
    if (currentFilter === 'all') {
        filteredArticles = [...articlesData];
    } else {
        filteredArticles = articlesData.filter(article => article.source === currentFilter);
    }
    
    if (filteredArticles.length === 0) {
        articlesContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-content">
                    <i class="fas fa-inbox"></i>
                    <p>Aucun article trouvé pour cette source</p>
                    <button onclick="fetchRSSFeeds()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer;">
                        Recharger les flux
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    articlesContainer.innerHTML = '';
    const template = document.getElementById('article-template');
    
    filteredArticles.forEach((article, index) => {
        const clone = template.content.cloneNode(true);
        const articleCard = clone.querySelector('.article-card');
        
        // Effet d'apparition séquentiel
        articleCard.style.animationDelay = `${index * 0.1}s`;
        
        // Remplir les données
        const sourceBadge = clone.querySelector('.source-badge');
        sourceBadge.textContent = article.source;
        sourceBadge.className = `source-badge ${article.source}`;
        
        clone.querySelector('.article-date').textContent = article.date;
        clone.querySelector('.article-title').textContent = article.title;
        clone.querySelector('.article-excerpt').textContent = article.excerpt;
        clone.querySelector('.read-link').href = article.link;
        clone.querySelector('.article-category').textContent = article.category;
        
        articlesContainer.appendChild(clone);
    });
    
    // Mettre à jour le compteur
    if (totalArticlesElement) {
        totalArticlesElement.textContent = filteredArticles.length;
    }
}

// Fonction pour filtrer les articles
function filterArticles(source) {
    currentFilter = source;
    
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === source);
    });
    
    renderArticles();
}

// Fonction pour rafraîchir les articles
async function refreshArticles() {
    if (isLoading) return;
    
    if (refreshButton) {
        refreshButton.classList.add('refreshing');
        refreshButton.disabled = true;
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Synchronisation...';
    }
    
    await fetchRSSFeeds();
    
    // Notification
    showNotification('Flux RSS actualisés avec succès', 'success');
    
    if (refreshButton) {
        refreshButton.classList.remove('refreshing');
        refreshButton.disabled = false;
        refreshButton.innerHTML = '<i class="fas fa-redo"></i> Synchroniser maintenant';
    }
}

// Fonction pour afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
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
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border-left: 4px solid ${color};
        display: flex;
        align-items: center;
        gap: 0.8rem;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialisation
async function init() {
    // Menu mobile
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Événements des filtres
    filterButtons.forEach(button => {
        button.addEventListener('click', () => filterArticles(button.dataset.filter));
    });
    
    // Événement du bouton rafraîchir
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshArticles);
    }
    
    // Charger les flux au démarrage
    await fetchRSSFeeds();
    
    // Mettre à jour l'heure en continu
    setInterval(updateTime, 1000);
    
    // Rotation automatique toutes les 5 minutes
    setInterval(() => {
        if (!isLoading) {
            fetchRSSFeeds();
            showNotification('Mise à jour automatique des flux', 'info');
        }
    }, 5 * 60 * 1000);
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', init);
