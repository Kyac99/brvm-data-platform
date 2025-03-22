# BRVM Data Platform

## Présentation
Plateforme centralisant les données de la Bourse Régionale des Valeurs Mobilières (BRVM). Ce projet vise à collecter, traiter et présenter de façon pertinente les informations essentielles du marché financier de l'UEMOA.

## Objectifs
- Collecter automatiquement les données de la BRVM
- Stocker l'historique des cotations et indicateurs
- Présenter les données de façon claire et interactive
- Fournir des analyses de tendances et des outils d'aide à la décision

## Fonctionnalités
- 📈 Suivi en temps réel des cours des actions
- 📊 Visualisation des données historiques
- 🏢 Fiches détaillées des sociétés cotées
- 📰 Actualités du marché
- 📱 Interface responsive adaptée à tous les appareils

## Structure du projet
```
brvm-data-platform/
├── data/                 # Dossier stockant les données collectées
├── scripts/              # Scripts de collecte (scraping) des données
│   ├── scraper.py        # Script principal de collecte
│   └── utils.py          # Fonctions utilitaires
├── web/                  # Interface web de présentation
│   ├── index.html        # Page principale
│   ├── css/              # Styles
│   ├── js/               # Scripts JavaScript
│   └── components/       # Composants réutilisables
└── analysis/             # Scripts d'analyse des données
```

## Installation

### Prérequis
- Python 3.8+
- Node.js 14+
- MongoDB (pour le stockage des données)

### Installation des dépendances
```bash
# Installation des dépendances Python
pip install -r requirements.txt

# Installation des dépendances JavaScript
cd web
npm install
```

## Utilisation
1. Collecte des données:
```bash
python scripts/scraper.py
```

2. Lancement de l'interface web:
```bash
cd web
npm start
```

3. Ouvrir dans le navigateur: http://localhost:3000

## Avertissement légal
Ce projet est conçu à des fins éducatives et informatives. La collecte de données est effectuée dans le respect des conditions d'utilisation du site officiel de la BRVM. Les données présentées ne constituent pas des conseils financiers ou d'investissement.

## Licence
MIT License
