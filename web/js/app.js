/**
 * BRVM Data Platform - Application principale
 * Gère l'initialisation et les interactions de l'interface utilisateur
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser l'application
    initApp();
});

/**
 * Initialise l'application principale
 */
function initApp() {
    console.log('Initialisation de BRVM Data Platform...');
    
    // Charger les données initiales
    loadInitialData();
    
    // Configuration des écouteurs d'événements
    setupEventListeners();
    
    // Gestion du défilement fluide pour les liens d'ancrage
    setupSmoothScrolling();
}

/**
 * Charge les données initiales pour l'affichage
 */
async function loadInitialData() {
    try {
        // Afficher le statut du marché
        const marketStatus = await brvm_api.getMarketStatus();
        updateMarketStatus(marketStatus);
        
        // Charger et afficher les indices
        const indices = await brvm_api.getIndices();
        updateIndicesDisplay(indices);
        
        // Charger et afficher les actions
        const stocks = await brvm_api.getStocks();
        updateStocksTable(stocks);
        
        // Charger et afficher les obligations
        const bonds = await brvm_api.getBonds();
        updateBondsTable(bonds);
        
        // Charger et afficher les actualités
        const news = await brvm_api.getMarketNews();
        updateMarketNews(news);
        
        // Initialiser les graphiques
        brvm_charts.initCharts({
            indices: indices,
            stocks: stocks
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement des données initiales:', error);
        displayErrorMessage('Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.');
    }
}

/**
 * Met à jour l'affichage du statut du marché
 * @param {Object} status Statut du marché
 */
function updateMarketStatus(status) {
    if (!status) return;
    
    const marketStatusElem = document.getElementById('market-status');
    const updateDateElem = document.getElementById('update-date');
    
    if (marketStatusElem) {
        const badge = marketStatusElem.querySelector('.badge');
        
        if (status.market_status === 'open') {
            badge.textContent = 'Marché ouvert';
            badge.className = 'badge bg-success';
        } else {
            badge.textContent = 'Marché fermé';
            badge.className = 'badge bg-secondary';
        }
    }
    
    if (updateDateElem) {
        updateDateElem.textContent = status.last_update || new Date().toLocaleString('fr-FR');
    }
}

/**
 * Met à jour l'affichage des indices
 * @param {Array} indices Données des indices
 */
function updateIndicesDisplay(indices) {
    if (!indices || indices.length === 0) return;
    
    // Mise à jour de l'indice composite dans l'en-tête
    const compositeIndex = indices.find(index => index.name === 'BRVM Composite');
    
    if (compositeIndex) {
        const compositeElem = document.getElementById('composite-index');
        const compositeChangeElem = document.getElementById('composite-change');
        
        if (compositeElem) {
            compositeElem.textContent = compositeIndex.value.toFixed(2);
        }
        
        if (compositeChangeElem) {
            const change = compositeIndex.change_percent;
            compositeChangeElem.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            compositeChangeElem.className = change >= 0 ? 'badge bg-success' : 'badge bg-danger';
        }
    }
    
    // Mise à jour du tableau des indices
    const indicesTableBody = document.querySelector('#indices-table tbody');
    
    if (indicesTableBody) {
        indicesTableBody.innerHTML = '';
        
        indices.forEach(index => {
            const row = document.createElement('tr');
            
            // Formatage des données
            const changeClass = index.change_percent >= 0 ? 'positive-change' : 'negative-change';
            
            row.innerHTML = `
                <td>${index.name}</td>
                <td>${index.value.toFixed(2)}</td>
                <td class="${changeClass}">${index.change_percent >= 0 ? '+' : ''}${index.change_percent.toFixed(2)}%</td>
            `;
            
            indicesTableBody.appendChild(row);
        });
    }
}

/**
 * Met à jour le tableau des actions
 * @param {Array} stocks Données des actions
 */
function updateStocksTable(stocks) {
    if (!stocks || stocks.length === 0) return;
    
    const stocksTableBody = document.querySelector('#stocks-table tbody');
    
    if (stocksTableBody) {
        stocksTableBody.innerHTML = '';
        
        stocks.forEach(stock => {
            const row = document.createElement('tr');
            
            // Formatage des données
            const changeClass = stock.change > 0 ? 'positive-change' : stock.change < 0 ? 'negative-change' : '';
            
            row.innerHTML = `
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td>${Number(stock.last_price).toLocaleString()}</td>
                <td class="${changeClass}">${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}%</td>
                <td>${Number(stock.high).toLocaleString()}</td>
                <td>${Number(stock.low).toLocaleString()}</td>
                <td>${Number(stock.volume).toLocaleString()}</td>
            `;
            
            stocksTableBody.appendChild(row);
        });
    }
}

/**
 * Met à jour le tableau des obligations
 * @param {Array} bonds Données des obligations
 */
function updateBondsTable(bonds) {
    if (!bonds || bonds.length === 0) return;
    
    const bondsTableBody = document.querySelector('#bonds-table tbody');
    
    if (bondsTableBody) {
        bondsTableBody.innerHTML = '';
        
        bonds.forEach(bond => {
            const row = document.createElement('tr');
            
            // Formatage des données
            const changeClass = bond.change > 0 ? 'positive-change' : bond.change < 0 ? 'negative-change' : '';
            
            row.innerHTML = `
                <td>${bond.symbol}</td>
                <td>${bond.name}</td>
                <td>${Number(bond.last_price).toLocaleString()}</td>
                <td class="${changeClass}">${bond.change > 0 ? '+' : ''}${bond.change.toFixed(2)}%</td>
                <td>${bond.yield.toFixed(2)}%</td>
                <td>${formatDate(bond.maturity_date)}</td>
            `;
            
            bondsTableBody.appendChild(row);
        });
    }
}

/**
 * Met à jour la section des actualités du marché
 * @param {Array} news Données des actualités
 */
function updateMarketNews(news) {
    if (!news || news.length === 0) return;
    
    const newsContainer = document.getElementById('market-news');
    
    if (newsContainer) {
        newsContainer.innerHTML = '';
        
        news.forEach(item => {
            const newsCard = document.createElement('div');
            newsCard.className = 'card mb-3 animate-fade-in';
            
            newsCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${formatDate(item.date)} | Source: ${item.source}</h6>
                    <p class="card-text">${item.content}</p>
                </div>
            `;
            
            newsContainer.appendChild(newsCard);
        });
    }
}

/**
 * Configure les écouteurs d'événements pour l'interface
 */
function setupEventListeners() {
    // Recherche d'actions
    const stockSearch = document.getElementById('stock-search');
    if (stockSearch) {
        stockSearch.addEventListener('input', function() {
            filterTable('stocks-table', this.value);
        });
    }
    
    // Recherche d'obligations
    const bondSearch = document.getElementById('bond-search');
    if (bondSearch) {
        bondSearch.addEventListener('input', function() {
            filterTable('bonds-table', this.value);
        });
    }
    
    // Gestion des liens de navigation
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Retirer la classe active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            // Ajouter la classe active au lien cliqué
            this.classList.add('active');
        });
    });
}

/**
 * Filtre un tableau en fonction d'un terme de recherche
 * @param {string} tableId ID du tableau
 * @param {string} term Terme de recherche
 */
function filterTable(tableId, term) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    const lowerTerm = term.toLowerCase();
    
    rows.forEach(row => {
        let found = false;
        const cells = row.querySelectorAll('td');
        
        cells.forEach(cell => {
            if (cell.textContent.toLowerCase().includes(lowerTerm)) {
                found = true;
            }
        });
        
        row.style.display = found ? '' : 'none';
    });
}

/**
 * Configure le défilement fluide pour les liens d'ancrage
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Formate une date au format français
 * @param {string} dateStr Chaîne de date
 * @returns {string} Date formatée
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Affiche un message d'erreur
 * @param {string} message Message d'erreur
 */
function displayErrorMessage(message) {
    // Créer un élément d'alerte
    const alertElem = document.createElement('div');
    alertElem.className = 'alert alert-danger alert-dismissible fade show';
    alertElem.role = 'alert';
    alertElem.innerHTML = `
        <strong>Erreur!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button>
    `;
    
    // Ajouter au début du contenu principal
    const container = document.querySelector('.container');
    if (container) {
        container.prepend(alertElem);
    }
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        alertElem.classList.remove('show');
        setTimeout(() => alertElem.remove(), 500);
    }, 5000);
}
