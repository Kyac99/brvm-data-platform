#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de démarrage pour la BRVM Data Platform
Permet de collecter les données et démarrer le serveur
"""

import os
import sys
import time
import argparse
import subprocess
import logging
import schedule
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("run.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("brvm_run")

# Chemins des scripts
BASE_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = BASE_DIR / "scripts"
API_DIR = BASE_DIR / "api"
SCRAPER_SCRIPT = SCRIPTS_DIR / "scraper.py"
API_SCRIPT = API_DIR / "app.py"

def parse_arguments():
    """Parse les arguments de ligne de commande"""
    parser = argparse.ArgumentParser(description='BRVM Data Platform - Script de démarrage')
    
    parser.add_argument('--collect-only', action='store_true', 
                        help='Exécuter uniquement la collecte de données')
    
    parser.add_argument('--serve-only', action='store_true', 
                        help='Démarrer uniquement le serveur API sans collecter les données')
    
    parser.add_argument('--schedule', action='store_true', 
                        help='Planifier la collecte automatique des données à intervalle régulier')
    
    parser.add_argument('--interval', type=int, default=60,
                        help='Intervalle en minutes entre chaque collecte (par défaut: 60)')
    
    parser.add_argument('--port', type=int, default=5000,
                        help='Port pour le serveur API (par défaut: 5000)')
    
    return parser.parse_args()


def collect_data():
    """Exécute le script de collecte des données"""
    logger.info("Démarrage de la collecte des données BRVM...")
    
    try:
        # Exécuter le script de collecte
        result = subprocess.run([sys.executable, str(SCRAPER_SCRIPT)], 
                               capture_output=True, text=True, check=True)
        
        logger.info("Collecte des données terminée avec succès")
        logger.debug(result.stdout)
        return True
    
    except subprocess.CalledProcessError as e:
        logger.error(f"Erreur lors de la collecte des données: {e}")
        logger.error(f"Sortie d'erreur: {e.stderr}")
        return False


def start_server(port=5000):
    """Démarre le serveur API"""
    logger.info(f"Démarrage du serveur API sur le port {port}...")
    
    try:
        # Définir la variable d'environnement pour le port
        env = os.environ.copy()
        env["FLASK_APP"] = str(API_SCRIPT)
        env["FLASK_ENV"] = "development"
        
        # Démarrer le serveur Flask
        server_process = subprocess.Popen(
            [sys.executable, str(API_SCRIPT)],
            env=env
        )
        
        logger.info(f"Serveur API démarré avec PID {server_process.pid}")
        logger.info(f"Interface accessible à l'adresse: http://localhost:{port}")
        
        return server_process
    
    except Exception as e:
        logger.error(f"Erreur lors du démarrage du serveur API: {e}")
        return None


def schedule_collection(interval):
    """Planifie la collecte de données à intervalle régulier"""
    logger.info(f"Planification de la collecte des données toutes les {interval} minutes")
    
    # Première collecte immédiate
    collect_data()
    
    # Planifier les collectes suivantes
    schedule.every(interval).minutes.do(collect_data)
    
    # Boucle principale pour exécuter les tâches planifiées
    while True:
        schedule.run_pending()
        time.sleep(1)


def main():
    """Fonction principale"""
    args = parse_arguments()
    
    # Mode de fonctionnement en fonction des arguments
    if args.collect_only:
        # Exécuter uniquement la collecte
        collect_data()
    
    elif args.serve_only:
        # Démarrer uniquement le serveur
        server_process = start_server(args.port)
        
        # Attendre que le processus du serveur se termine
        if server_process:
            try:
                server_process.wait()
            except KeyboardInterrupt:
                logger.info("Arrêt du serveur API...")
                server_process.terminate()
                server_process.wait()
    
    elif args.schedule:
        # Démarrer le serveur
        server_process = start_server(args.port)
        
        # Planifier la collecte de données
        try:
            schedule_collection(args.interval)
        except KeyboardInterrupt:
            logger.info("Arrêt du programme...")
            if server_process:
                logger.info("Arrêt du serveur API...")
                server_process.terminate()
                server_process.wait()
    
    else:
        # Mode par défaut: collecte puis serveur
        if collect_data():
            server_process = start_server(args.port)
            
            # Attendre que le processus du serveur se termine
            if server_process:
                try:
                    server_process.wait()
                except KeyboardInterrupt:
                    logger.info("Arrêt du serveur API...")
                    server_process.terminate()
                    server_process.wait()


if __name__ == "__main__":
    main()
