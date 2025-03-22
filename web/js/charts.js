/**
 * BRVM Data Platform - Module Charts
 * Gestion des graphiques et visualisations
 */

class BRVMCharts {
    constructor() {
        // Stockage des instances de graphiques pour mise à jour ultérieure
        this.charts = {};
        
        // Couleurs pour les graphiques
        this.colors = {
            primary: '#0d6efd',
            secondary: '#6c757d',
            success: '#198754',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#0dcaf0',
            light: '#f8f9fa',
            dark: '#212529',
            primaryLight: '#cfe2ff',
            secondaryLight: '#e2e3e5'
        };
    }

    /**
     * Initialise tous les graphiques de la page
     * @param {Object} data Données pour les graphiques
     */
    initCharts(data) {
        // Récupération des données
        const { indices, stocks, sectors } = data;
        
        // Initialisation des graphiques si les éléments canvas existent
        if (document.getElementById('indices-chart')) {
            this.createIndicesChart(indices);
        }
        
        if (document.getElementById('sectors-chart')) {
            this.createSectorsChart(sectors || this.getSectorsFromIndices(indices));
        }
        
        if (document.getElementById('composite-chart')) {
            this.createHistoricalChart('composite-chart', 'BRVM Composite', this.getExampleHistoricalData());
        }
        
        if (document.getElementById('brvm10-chart')) {
            this.createHistoricalChart('brvm10-chart', 'BRVM 10', this.getExampleHistoricalData());
        }
    }

    /**
     * Crée un graphique pour les indices boursiers
     * @param {Array} indices Données des indices
     */
    createIndicesChart(indices) {
        const ctx = document.getElementById('indices-chart');
        
        // Préparer les données pour le graphique
        const labels = indices.map(index => index.name);
        const values = indices.map(index => index.value);
        const changes = indices.map(index => index.change_percent);
        
        // Couleurs selon les variations (positives ou négatives)
        const backgroundColors = changes.map(change => 
            change >= 0 ? this.colors.primaryLight : this.colors.secondaryLight
        );
        
        const borderColors = changes.map(change => 
            change >= 0 ? this.colors.primary : this.colors.danger
        );
        
        // Création du graphique
        this.charts.indices = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valeur de l\'indice',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Valeurs des Indices BRVM'
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const changeIndex = context.dataIndex;
                                const change = changes[changeIndex];
                                return `Variation: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    /**
     * Crée un graphique pour les performances sectorielles
     * @param {Array} sectors Données des secteurs
     */
    createSectorsChart(sectors) {
        const ctx = document.getElementById('sectors-chart');
        
        // Préparer les données pour le graphique
        const labels = sectors.map(sector => sector.name);
        const changes = sectors.map(sector => sector.change_percent);
        
        // Couleurs selon les variations (positives ou négatives)
        const backgroundColors = changes.map(change => 
            change >= 0 ? this.colors.success : this.colors.danger
        );
        
        // Création du graphique
        this.charts.sectors = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: labels,
                datasets: [{
                    data: changes.map(change => Math.abs(change)),
                    backgroundColor: backgroundColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performances sectorielles (%)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const changeIndex = context.dataIndex;
                                const change = changes[changeIndex];
                                return `${labels[changeIndex]}: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Crée un graphique pour les données historiques
     * @param {string} chartId ID de l'élément canvas
     * @param {string} title Titre du graphique
     * @param {Array} data Données historiques
     */
    createHistoricalChart(chartId, title, data) {
        const ctx = document.getElementById(chartId);
        
        // Préparer les données pour le graphique
        const labels = data.map(point => point.date);
        const values = data.map(point => point.value);
        
        // Création du graphique
        this.charts[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: values,
                    backgroundColor: this.colors.primaryLight,
                    borderColor: this.colors.primary,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Évolution historique - ${title}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    /**
     * Extrait les données sectorielles à partir des indices
     * @param {Array} indices Données des indices
     * @returns {Array} Données des secteurs
     */
    getSectorsFromIndices(indices) {
        // Filtrer uniquement les indices sectoriels
        return indices.filter(index => 
            index.name.includes('Agriculture') || 
            index.name.includes('Distribution') || 
            index.name.includes('Finance') || 
            index.name.includes('Industrie') || 
            index.name.includes('Services') || 
            index.name.includes('Transport')
        );
    }

    /**
     * Génère des données historiques d'exemple (pour démo)
     * @returns {Array} Données historiques d'exemple
     */
    getExampleHistoricalData() {
        const data = [];
        const today = new Date();
        const baseValue = 215; // Valeur de base pour le graphique
        
        // Générer des données pour les 30 derniers jours
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Valeur aléatoire avec tendance légèrement haussière
            const randomChange = (Math.random() - 0.45) * 2;
            const value = baseValue + (30 - i) * 0.1 + randomChange;
            
            data.push({
                date: date.toISOString().split('T')[0],
                value: parseFloat(value.toFixed(2))
            });
        }
        
        return data;
    }

    /**
     * Met à jour les graphiques avec de nouvelles données
     * @param {string} chartId ID du graphique à mettre à jour
     * @param {Array} newData Nouvelles données
     */
    updateChart(chartId, newData) {
        if (!this.charts[chartId]) {
            console.error(`Le graphique ${chartId} n'existe pas`);
            return;
        }
        
        const chart = this.charts[chartId];
        
        // Mettre à jour les données du graphique
        chart.data.labels = newData.labels;
        chart.data.datasets[0].data = newData.values;
        
        // Si des couleurs sont fournies
        if (newData.backgroundColors) {
            chart.data.datasets[0].backgroundColor = newData.backgroundColors;
        }
        
        if (newData.borderColors) {
            chart.data.datasets[0].borderColor = newData.borderColors;
        }
        
        // Mettre à jour le graphique
        chart.update();
    }
}

// Exporter la classe pour utilisation dans d'autres modules
const brvm_charts = new BRVMCharts();
