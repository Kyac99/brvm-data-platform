/**
 * BRVM Data Platform - Module API
 * Gestion des appels API et récupération des données
 */

class BRVMApi {
    constructor() {
        // Base URL de l'API (à configurer selon votre déploiement)
        this.apiBaseUrl = '/api';
        
        // En mode développement, utiliser les fichiers JSON statiques
        this.devMode = true;
        this.dataPath = '../data/processed';
    }

    /**
     * Récupère le statut actuel du marché
     * @returns {Promise} Promesse contenant les données du statut du marché
     */
    async getMarketStatus() {
        if (this.devMode) {
            try {
                const date = new Date().toISOString().split('T')[0];
                const response = await fetch(`${this.dataPath}/market_status_${date}.json`);
                
                if (!response.ok) {
                    // Si le fichier du jour n'existe pas, utiliser un exemple
                    return {
                        market_status: 'closed',
                        last_update: new Date().toLocaleString('fr-FR')
                    };
                }
                
                return await response.json();
            } catch (error) {
                console.error('Erreur lors de la récupération du statut du marché:', error);
                return null;
            }
        } else {
            try {
                const response = await fetch(`${this.apiBaseUrl}/market-status`);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erreur lors de la récupération du statut du marché:', error);
                return null;
            }
        }
    }

    /**
     * Récupère les données des indices
     * @returns {Promise} Promesse contenant les données des indices
     */
    async getIndices() {
        if (this.devMode) {
            try {
                const date = new Date().toISOString().split('T')[0];
                const response = await fetch(`${this.dataPath}/indices_${date}.csv`);
                
                if (!response.ok) {
                    // Si le fichier du jour n'existe pas, utiliser un exemple
                    return this.getExampleIndices();
                }
                
                const csvText = await response.text();
                return this.parseCSV(csvText);
            } catch (error) {
                console.error('Erreur lors de la récupération des indices:', error);
                return this.getExampleIndices();
            }
        } else {
            try {
                const response = await fetch(`${this.apiBaseUrl}/indices`);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erreur lors de la récupération des indices:', error);
                return null;
            }
        }
    }

    /**
     * Récupère les données des actions
     * @returns {Promise} Promesse contenant les données des actions
     */
    async getStocks() {
        if (this.devMode) {
            try {
                const date = new Date().toISOString().split('T')[0];
                const response = await fetch(`${this.dataPath}/stocks_${date}.csv`);
                
                if (!response.ok) {
                    // Si le fichier du jour n'existe pas, utiliser un exemple
                    return this.getExampleStocks();
                }
                
                const csvText = await response.text();
                return this.parseCSV(csvText);
            } catch (error) {
                console.error('Erreur lors de la récupération des actions:', error);
                return this.getExampleStocks();
            }
        } else {
            try {
                const response = await fetch(`${this.apiBaseUrl}/stocks`);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erreur lors de la récupération des actions:', error);
                return null;
            }
        }
    }

    /**
     * Récupère les données des obligations
     * @returns {Promise} Promesse contenant les données des obligations
     */
    async getBonds() {
        if (this.devMode) {
            try {
                const date = new Date().toISOString().split('T')[0];
                const response = await fetch(`${this.dataPath}/bonds_${date}.csv`);
                
                if (!response.ok) {
                    // Si le fichier du jour n'existe pas, utiliser un exemple
                    return this.getExampleBonds();
                }
                
                const csvText = await response.text();
                return this.parseCSV(csvText);
            } catch (error) {
                console.error('Erreur lors de la récupération des obligations:', error);
                return this.getExampleBonds();
            }
        } else {
            try {
                const response = await fetch(`${this.apiBaseUrl}/bonds`);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erreur lors de la récupération des obligations:', error);
                return null;
            }
        }
    }

    /**
     * Récupère les actualités du marché
     * @returns {Promise} Promesse contenant les actualités
     */
    async getMarketNews() {
        if (this.devMode) {
            // En mode dev, retourner des actualités d'exemple
            return this.getExampleNews();
        } else {
            try {
                const response = await fetch(`${this.apiBaseUrl}/news`);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erreur lors de la récupération des actualités:', error);
                return null;
            }
        }
    }

    /**
     * Parse les données CSV
     * @param {string} csvText Texte CSV à parser
     * @returns {Array} Tableau d'objets contenant les données
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',').map(value => value.trim());
            const entry = {};
            
            headers.forEach((header, index) => {
                // Conversion des valeurs numériques
                if (!isNaN(values[index]) && values[index] !== '') {
                    entry[header] = parseFloat(values[index]);
                } else {
                    entry[header] = values[index];
                }
            });
            
            result.push(entry);
        }
        
        return result;
    }

    /**
     * Génère des données d'exemple pour les indices
     * @returns {Array} Tableau d'objets contenant les indices d'exemple
     */
    getExampleIndices() {
        return [
            { name: 'BRVM Composite', value: 218.45, change_percent: 0.72 },
            { name: 'BRVM 10', value: 164.29, change_percent: 0.94 },
            { name: 'BRVM Agriculture', value: 132.56, change_percent: -0.32 },
            { name: 'BRVM Distribution', value: 518.23, change_percent: 1.42 },
            { name: 'BRVM Finance', value: 158.67, change_percent: 0.28 },
            { name: 'BRVM Industrie', value: 201.34, change_percent: 0.55 },
            { name: 'BRVM Services Publics', value: 178.92, change_percent: 0.87 },
            { name: 'BRVM Transport', value: 142.18, change_percent: -0.45 }
        ];
    }

    /**
     * Génère des données d'exemple pour les actions
     * @returns {Array} Tableau d'objets contenant les actions d'exemple
     */
    getExampleStocks() {
        return [
            { symbol: 'BICC', name: 'BICI Côte d\'Ivoire', last_price: 6300, change: 1.61, high: 6400, low: 6200, volume: 1250 },
            { symbol: 'BOAB', name: 'Bank of Africa Bénin', last_price: 3950, change: -0.88, high: 4000, low: 3900, volume: 832 },
            { symbol: 'BOAM', name: 'Bank of Africa Mali', last_price: 1350, change: 0.00, high: 1350, low: 1350, volume: 420 },
            { symbol: 'CABC', name: 'Compagnie Agricole du Bois Carré', last_price: 435, change: 2.11, high: 440, low: 425, volume: 2150 },
            { symbol: 'ETIT', name: 'Ecobank Transnational Inc', last_price: 18, change: -1.64, high: 18.5, low: 17.9, volume: 45280 },
            { symbol: 'ONTBF', name: 'Onatel Burkina Faso', last_price: 2500, change: 0.40, high: 2515, low: 2490, volume: 370 },
            { symbol: 'PALC', name: 'Palm Côte d\'Ivoire', last_price: 6750, change: 0.75, high: 6800, low: 6700, volume: 220 },
            { symbol: 'SGBC', name: 'SGB Côte d\'Ivoire', last_price: 12500, change: 1.21, high: 12600, low: 12400, volume: 180 },
            { symbol: 'SIVC', name: 'SOLIBRA Côte d\'Ivoire', last_price: 18000, change: 0.00, high: 18000, low: 18000, volume: 95 },
            { symbol: 'SNTS', name: 'Sonatel Sénégal', last_price: 16100, change: 0.63, high: 16250, low: 16050, volume: 650 }
        ];
    }

    /**
     * Génère des données d'exemple pour les obligations
     * @returns {Array} Tableau d'objets contenant les obligations d'exemple
     */
    getExampleBonds() {
        return [
            { symbol: 'TPCI.O1', name: 'Trésor Public Côte d\'Ivoire 6.5% 2021-2028', last_price: 9850, change: 0.10, yield: 6.75, maturity_date: '2028-06-15' },
            { symbol: 'TPCI.O2', name: 'Trésor Public Côte d\'Ivoire 5.75% 2022-2027', last_price: 9920, change: 0.05, yield: 5.95, maturity_date: '2027-03-22' },
            { symbol: 'TPSN.O3', name: 'Trésor Public Sénégal 6.25% 2020-2026', last_price: 9880, change: -0.15, yield: 6.45, maturity_date: '2026-11-08' },
            { symbol: 'TPBF.O1', name: 'Trésor Public Burkina Faso 6.10% 2021-2029', last_price: 9790, change: 0.25, yield: 6.65, maturity_date: '2029-09-30' },
            { symbol: 'SBCI.O1', name: 'SGBCI 5.9% 2022-2027', last_price: 9950, change: 0.00, yield: 6.05, maturity_date: '2027-05-12' },
            { symbol: 'BIDC.O1', name: 'BIDC/EBID 6.0% 2021-2028', last_price: 9930, change: -0.05, yield: 6.10, maturity_date: '2028-07-20' },
            { symbol: 'BOAD.O2', name: 'BOAD 5.85% 2022-2029', last_price: 9910, change: 0.05, yield: 6.00, maturity_date: '2029-02-10' },
            { symbol: 'TPML.O1', name: 'Trésor Public Mali 6.2% 2021-2026', last_price: 9800, change: -0.10, yield: 6.50, maturity_date: '2026-08-15' }
        ];
    }

    /**
     * Génère des actualités d'exemple pour le marché
     * @returns {Array} Tableau d'objets contenant les actualités d'exemple
     */
    getExampleNews() {
        return [
            {
                title: 'La BRVM clôture en hausse de 0.72% ce vendredi',
                date: '2025-03-21',
                content: 'Le marché actions de la Bourse Régionale des Valeurs Mobilières (BRVM) a terminé la séance de ce vendredi en territoire positif avec une progression de 0,72% de l\'indice BRVM Composite.',
                source: 'BRVM'
            },
            {
                title: 'Sonatel publie des résultats en hausse pour 2024',
                date: '2025-03-20',
                content: 'Le groupe Sonatel a annoncé des résultats en hausse pour l\'exercice 2024, avec un chiffre d\'affaires en progression de 7,2% et un résultat net en hausse de 9,5%.',
                source: 'Agence Ecofin'
            },
            {
                title: 'Nouvelle émission obligataire du Trésor Public de Côte d\'Ivoire',
                date: '2025-03-18',
                content: 'Le Trésor Public de Côte d\'Ivoire a lancé une nouvelle émission obligataire de 100 milliards FCFA sur le marché financier régional avec un taux d\'intérêt de 6,15%.',
                source: 'Financial Afrik'
            },
            {
                title: 'La BOAD annonce un plan de financement de 500 milliards FCFA pour soutenir les économies de l\'UEMOA',
                date: '2025-03-15',
                content: 'La Banque Ouest Africaine de Développement (BOAD) a annoncé un plan de financement de 500 milliards FCFA pour soutenir les économies des pays membres de l\'UEMOA face aux défis économiques actuels.',
                source: 'Jeune Afrique'
            },
            {
                title: 'ECOBANK Transnational Incorporated distribue un dividende de 0,16 USD par action',
                date: '2025-03-12',
                content: 'Le groupe bancaire panafricain ETI a annoncé la distribution d\'un dividende de 0,16 USD par action au titre de l\'exercice 2024, en hausse de 12% par rapport à l\'année précédente.',
                source: 'BRVM'
            }
        ];
    }
}

// Exporter l'API pour utilisation dans d'autres modules
const brvm_api = new BRVMApi();
