# Guide d'installation - BRVM Data Platform

Ce guide décrit les étapes pour installer et configurer la plateforme de données BRVM sur votre environnement.

## Prérequis

Avant de commencer, assurez-vous que les logiciels suivants sont installés sur votre système:

- **Python 3.8+** - [Télécharger Python](https://www.python.org/downloads/)
- **Git** - [Télécharger Git](https://git-scm.com/downloads)
- **MongoDB** (optionnel pour le stockage avancé) - [Télécharger MongoDB](https://www.mongodb.com/try/download/community)

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/Kyac99/brvm-data-platform.git
cd brvm-data-platform
```

### 2. Créer un environnement virtuel Python

Créez et activez un environnement virtuel pour isoler les dépendances du projet:

```bash
# Sur Windows
python -m venv venv
venv\Scripts\activate

# Sur macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Créer les répertoires de données

```bash
mkdir -p data/raw data/processed
```

### 5. Configuration (Optionnel)

Si vous souhaitez utiliser MongoDB pour le stockage des données, modifiez le script `scripts/scraper.py` et décommentez les lignes correspondantes:

```python
# Utilisation avec MongoDB
scraper = BRVMScraper(use_db=True, db_uri="mongodb://localhost:27017/")
scraper.run()
```

## Utilisation

### Collecter les données

Pour collecter les données de la BRVM:

```bash
python scripts/scraper.py
```

### Démarrer l'application

Pour démarrer l'application complète (collecte de données + serveur web):

```bash
python run.py
```

Vous pouvez également utiliser les options suivantes:

- `--collect-only`: Exécute uniquement la collecte de données
- `--serve-only`: Démarre uniquement le serveur web
- `--schedule`: Programme la collecte de données à intervalles réguliers
- `--interval XX`: Définit l'intervalle en minutes entre chaque collecte (par défaut: 60)
- `--port XXXX`: Spécifie le port du serveur web (par défaut: 5000)

Exemples:

```bash
# Collecter les données uniquement
python run.py --collect-only

# Démarrer uniquement le serveur web sur le port 8080
python run.py --serve-only --port 8080

# Collecte automatique toutes les 30 minutes + serveur web
python run.py --schedule --interval 30
```

### Accéder à l'application

Une fois le serveur démarré, accédez à l'application via votre navigateur:

```
http://localhost:5000
```

## Déploiement en production

Pour un déploiement en production, voici quelques recommandations:

### Utiliser Gunicorn comme serveur WSGI

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api.app:app
```

### Utiliser Nginx comme proxy inverse

Installez Nginx et configurez-le pour rediriger les requêtes vers l'application Flask:

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Configurer un service systemd

Créez un fichier de service systemd pour démarrer automatiquement l'application:

```ini
[Unit]
Description=BRVM Data Platform
After=network.target

[Service]
User=votre_utilisateur
WorkingDirectory=/chemin/vers/brvm-data-platform
ExecStart=/chemin/vers/brvm-data-platform/venv/bin/python run.py --schedule
Restart=always

[Install]
WantedBy=multi-user.target
```

Activez et démarrez le service:

```bash
sudo systemctl enable brvm-data-platform
sudo systemctl start brvm-data-platform
```

## Dépannage

### Erreurs de scraping

Si vous rencontrez des erreurs lors du scraping:

1. Vérifiez votre connexion internet
2. Assurez-vous que le site de la BRVM est accessible
3. Vérifiez les logs dans `scraper.log`
4. Ajustez les sélecteurs CSS dans `scraper.py` si la structure du site a changé

### Erreurs de serveur

Si le serveur ne démarre pas correctement:

1. Vérifiez que le port n'est pas déjà utilisé
2. Consultez les logs dans `run.log`
3. Assurez-vous que toutes les dépendances sont installées
4. Vérifiez les permissions des répertoires de données

## Contribution

Pour contribuer au projet:

1. Créez une branche pour vos modifications
2. Soumettez une pull request
3. Suivez les conventions de code et ajoutez des tests si possible

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier LICENSE pour plus de détails.
