#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script d'initialisation pour la BRVM Data Platform
Crée la structure de dossiers et les fichiers nécessaires
"""

import os
import sys
import logging
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("brvm_setup")

def main():
    """Fonction principale pour la configuration initiale"""
    
    # Obtenir le répertoire de base du projet
    base_dir = Path(__file__).resolve().parent
    
    # Créer la structure de dossiers
    dirs = [
        base_dir / "data",
        base_dir / "data/raw",
        base_dir / "data/processed",
        base_dir / "logs"
    ]
    
    for directory in dirs:
        try:
            directory.mkdir(exist_ok=True)
            logger.info(f"Répertoire créé: {directory}")
        except Exception as e:
            logger.error(f"Erreur lors de la création du répertoire {directory}: {e}")
    
    # Créer des fichiers .gitkeep pour conserver la structure dans git
    gitkeep_dirs = [
        base_dir / "data/raw",
        base_dir / "data/processed",
        base_dir / "logs"
    ]
    
    for directory in gitkeep_dirs:
        gitkeep_file = directory / ".gitkeep"
        try:
            with open(gitkeep_file, 'w') as f:
                pass
            logger.info(f"Fichier créé: {gitkeep_file}")
        except Exception as e:
            logger.error(f"Erreur lors de la création du fichier {gitkeep_file}: {e}")
    
    logger.info("Configuration initiale terminée.")
    logger.info("Vous pouvez maintenant exécuter: `python run.py` pour démarrer l'application")

if __name__ == "__main__":
    main()
