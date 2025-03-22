# BRVM Data Platform

## Présentation
Plateforme centralisant les données de la Bourse Régionale des Valeurs Mobilières (BRVM). Ce projet vise à collecter, traiter et présenter de façon pertinente les informations essentielles du marché financier de l'UEMOA.

![BRVM Logo](https://www.brvm.org/sites/default/files/logo-brvm.png)

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

## Captures d'écran

![Tableau de bord](https://via.placeholder.com/800x400?text=Tableau+de+bord+BRVM)

## Structure du projet
```
brvm-data-platform/
├── data/                 # Dossier stockant les données collectées
│   ├── raw/              # Données brutes (JSON, CSV)
│   └── processed/        # Données transformées
├── scripts/              # Scripts de collecte (scraping) des données
│   ├── scraper.py        # Script principal de collecte
│   └── utils.py          # Fonctions utilitaires
├── web/                  # Interface web de présentation
│   ├── index.html        # Page principale
│   ├── css/              # Styles
│   ├── js/               # Scripts JavaScript
│   └── components/       # Composants réutilisables
├── api/                  # API REST pour accéder aux données
│   └── app.py            # Serveur Flask
├── logs/                 # Journaux d'exécution
├── run.py                # Script de démarrage principal
└── setup.py              # Configuration initiale
```

## Technologies utilisées

### Backend
- **Python 3.8+** - Langage principal
- **BeautifulSoup** - Analyse HTML et extraction de données
- **Pandas** - Traitement et analyse de données
- **Flask** - Serveur API REST
- **MongoDB** (optionnel) - Stockage persistant

### Frontend
- **HTML5/CSS3** - Structure et style
- **JavaScript (ES6+)** - Logique côté client
- **Bootstrap 5** - Framework CSS responsive
- **Chart.js** - Visualisation de données

## Installation

Pour installer et configurer le projet, consultez le [Guide d'Installation](INSTALLATION.md).

## Utilisation

Après installation, vous pouvez exécuter l'application avec:

```bash
python run.py
```

L'interface web sera accessible à l'adresse: http://localhost:5000

## Avertissement légal

Ce projet est conçu à des fins éducatives et informatives. La collecte de données est effectuée dans le respect des conditions d'utilisation du site officiel de la BRVM. Les données présentées ne constituent pas des conseils financiers ou d'investissement.

## Contribuer

Les contributions sont les bienvenues! Pour contribuer:

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur ce dépôt.
