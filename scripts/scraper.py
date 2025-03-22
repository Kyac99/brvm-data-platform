#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de collecte des données de la BRVM (Bourse Régionale des Valeurs Mobilières)
Ce script récupère les données du site officiel de la BRVM et les structure
pour une utilisation ultérieure.
"""

import os
import sys
import time
import json
import logging
import datetime
import requests
from bs4 import BeautifulSoup
import pandas as pd
import pymongo
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scraper.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("brvm_scraper")

# Configuration des URLs
BASE_URL = "https://www.brvm.org"
MARKET_STATUS_URL = f"{BASE_URL}/fr/marche/status"
INDICES_URL = f"{BASE_URL}/fr/indices/historique"
STOCK_LIST_URL = f"{BASE_URL}/fr/cours-actions/liste"
BONDS_URL = f"{BASE_URL}/fr/cours-obligations/liste"

# Création des répertoires nécessaires
DATA_DIR = Path("../data")
DATA_DIR.mkdir(exist_ok=True)
(DATA_DIR / "raw").mkdir(exist_ok=True)
(DATA_DIR / "processed").mkdir(exist_ok=True)

class BRVMScraper:
    """Classe principale pour la collecte des données de la BRVM"""
    
    def __init__(self, use_db=False, db_uri=None):
        """Initialise le scraper"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        })
        
        # Configuration de la base de données MongoDB (optionnel)
        self.use_db = use_db
        if use_db and db_uri:
            self.client = pymongo.MongoClient(db_uri)
            self.db = self.client.brvm_data
            logger.info("Connexion à MongoDB établie")
        
        # Date d'aujourd'hui au format YYYY-MM-DD
        self.today = datetime.datetime.now().strftime("%Y-%m-%d")
        logger.info(f"Initialisation du scraper pour la date: {self.today}")
    
    def get_page(self, url):
        """Récupère une page web avec gestion des erreurs et des tentatives"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"Récupération de la page: {url}")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return response.text
            except requests.exceptions.RequestException as e:
                logger.error(f"Erreur lors de la récupération de {url}: {e}")
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Attente exponentielle
                    logger.info(f"Nouvelle tentative dans {wait_time} secondes...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"Échec après {max_retries} tentatives")
                    return None
    
    def parse_market_status(self):
        """Récupère le statut du marché (ouvert/fermé, dernière mise à jour)"""
        html = self.get_page(MARKET_STATUS_URL)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        status_data = {}
        
        try:
            # Statut du marché
            status_elem = soup.select_one('.market-status')
            if status_elem:
                status_text = status_elem.text.strip()
                status_data['market_status'] = 'open' if 'ouvert' in status_text.lower() else 'closed'
            
            # Date de la dernière mise à jour
            update_elem = soup.select_one('.market-date')
            if update_elem:
                status_data['last_update'] = update_elem.text.strip()
            
            logger.info(f"Statut du marché récupéré: {status_data}")
            return status_data
        
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse du statut du marché: {e}")
            return None
    
    def parse_indices(self):
        """Récupère les indices boursiers (BRVM Composite, BRVM 10, etc.)"""
        html = self.get_page(INDICES_URL)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        indices_data = {}
        
        try:
            # Tableau des indices
            indices_table = soup.select_one('table.indices-table')
            if indices_table:
                rows = indices_table.select('tbody tr')
                for row in rows:
                    cells = row.select('td')
                    if len(cells) >= 3:
                        index_name = cells[0].text.strip()
                        index_value = cells[1].text.strip().replace(' ', '').replace(',', '.')
                        index_change = cells[2].text.strip().replace(' ', '').replace(',', '.')
                        
                        # Nettoyage et conversion
                        try:
                            index_value = float(index_value)
                            index_change = float(index_change.rstrip('%'))
                        except ValueError:
                            pass
                        
                        indices_data[index_name] = {
                            'value': index_value,
                            'change_percent': index_change
                        }
            
            logger.info(f"Indices récupérés: {list(indices_data.keys())}")
            return indices_data
        
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse des indices: {e}")
            return None
    
    def parse_stocks(self):
        """Récupère la liste des actions cotées et leurs cours"""
        html = self.get_page(STOCK_LIST_URL)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        stocks_data = []
        
        try:
            # Tableau des actions
            stocks_table = soup.select_one('table.stocks-table')
            if stocks_table:
                rows = stocks_table.select('tbody tr')
                for row in rows:
                    cells = row.select('td')
                    if len(cells) >= 7:
                        stock = {
                            'symbol': cells[0].text.strip(),
                            'name': cells[1].text.strip(),
                            'isin': cells[2].text.strip() if len(cells) > 2 else None,
                            'last_price': self._parse_float(cells[3].text.strip()),
                            'change': self._parse_float(cells[4].text.strip()),
                            'high': self._parse_float(cells[5].text.strip()),
                            'low': self._parse_float(cells[6].text.strip()),
                            'volume': self._parse_int(cells[7].text.strip()) if len(cells) > 7 else None,
                            'date': self.today
                        }
                        stocks_data.append(stock)
            
            logger.info(f"Actions récupérées: {len(stocks_data)}")
            return stocks_data
        
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse des actions: {e}")
            return None
    
    def parse_bonds(self):
        """Récupère la liste des obligations et leurs cours"""
        html = self.get_page(BONDS_URL)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        bonds_data = []
        
        try:
            # Tableau des obligations
            bonds_table = soup.select_one('table.bonds-table')
            if bonds_table:
                rows = bonds_table.select('tbody tr')
                for row in rows:
                    cells = row.select('td')
                    if len(cells) >= 6:
                        bond = {
                            'symbol': cells[0].text.strip(),
                            'name': cells[1].text.strip(),
                            'isin': cells[2].text.strip() if len(cells) > 2 else None,
                            'last_price': self._parse_float(cells[3].text.strip()),
                            'change': self._parse_float(cells[4].text.strip()),
                            'yield': self._parse_float(cells[5].text.strip()),
                            'maturity_date': cells[6].text.strip() if len(cells) > 6 else None,
                            'date': self.today
                        }
                        bonds_data.append(bond)
            
            logger.info(f"Obligations récupérées: {len(bonds_data)}")
            return bonds_data
        
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse des obligations: {e}")
            return None
    
    def _parse_float(self, text):
        """Convertit une chaîne de caractères en nombre à virgule flottante"""
        try:
            return float(text.replace(' ', '').replace(',', '.').replace('%', ''))
        except (ValueError, AttributeError):
            return None
    
    def _parse_int(self, text):
        """Convertit une chaîne de caractères en nombre entier"""
        try:
            return int(text.replace(' ', '').replace(',', ''))
        except (ValueError, AttributeError):
            return None
    
    def save_to_file(self, data, filename):
        """Sauvegarde les données dans un fichier JSON"""
        file_path = DATA_DIR / "raw" / f"{filename}_{self.today}.json"
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"Données sauvegardées dans {file_path}")
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde dans {file_path}: {e}")
            return False
    
    def save_to_database(self, data, collection_name):
        """Sauvegarde les données dans MongoDB"""
        if not self.use_db:
            logger.warning("La base de données n'est pas configurée")
            return False
        
        try:
            collection = self.db[collection_name]
            
            # Si c'est une liste, insertion multiple
            if isinstance(data, list):
                result = collection.insert_many(data)
                logger.info(f"{len(result.inserted_ids)} documents insérés dans {collection_name}")
            else:
                # Ajout de la date d'aujourd'hui
                data['date'] = self.today
                result = collection.insert_one(data)
                logger.info(f"Document inséré dans {collection_name} avec ID: {result.inserted_id}")
            
            return True
        
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde dans MongoDB ({collection_name}): {e}")
            return False
    
    def run(self):
        """Exécute le processus complet de collecte"""
        logger.info("Démarrage de la collecte des données BRVM")
        
        # 1. Récupération du statut du marché
        market_status = self.parse_market_status()
        if market_status:
            self.save_to_file(market_status, "market_status")
            if self.use_db:
                self.save_to_database(market_status, "market_status")
        
        # 2. Récupération des indices
        indices = self.parse_indices()
        if indices:
            self.save_to_file(indices, "indices")
            if self.use_db:
                self.save_to_database(indices, "indices")
        
        # 3. Récupération des actions
        stocks = self.parse_stocks()
        if stocks:
            self.save_to_file(stocks, "stocks")
            if self.use_db:
                self.save_to_database(stocks, "stocks")
        
        # 4. Récupération des obligations
        bonds = self.parse_bonds()
        if bonds:
            self.save_to_file(bonds, "bonds")
            if self.use_db:
                self.save_to_database(bonds, "bonds")
        
        logger.info("Collecte des données BRVM terminée")
        
        # Création de fichiers CSV pour une utilisation plus facile
        self.create_csv_files(stocks, bonds, indices)
    
    def create_csv_files(self, stocks, bonds, indices):
        """Crée des fichiers CSV à partir des données collectées"""
        try:
            # Création du fichier CSV pour les actions
            if stocks:
                stocks_df = pd.DataFrame(stocks)
                stocks_csv_path = DATA_DIR / "processed" / f"stocks_{self.today}.csv"
                stocks_df.to_csv(stocks_csv_path, index=False)
                logger.info(f"Fichier CSV des actions créé: {stocks_csv_path}")
            
            # Création du fichier CSV pour les obligations
            if bonds:
                bonds_df = pd.DataFrame(bonds)
                bonds_csv_path = DATA_DIR / "processed" / f"bonds_{self.today}.csv"
                bonds_df.to_csv(bonds_csv_path, index=False)
                logger.info(f"Fichier CSV des obligations créé: {bonds_csv_path}")
            
            # Création du fichier CSV pour les indices
            if indices:
                # Conversion du dictionnaire en DataFrame
                indices_data = []
                for name, data in indices.items():
                    indices_data.append({
                        'name': name,
                        'value': data['value'],
                        'change_percent': data['change_percent'],
                        'date': self.today
                    })
                
                indices_df = pd.DataFrame(indices_data)
                indices_csv_path = DATA_DIR / "processed" / f"indices_{self.today}.csv"
                indices_df.to_csv(indices_csv_path, index=False)
                logger.info(f"Fichier CSV des indices créé: {indices_csv_path}")
        
        except Exception as e:
            logger.error(f"Erreur lors de la création des fichiers CSV: {e}")

if __name__ == "__main__":
    # Utilisation sans base de données
    scraper = BRVMScraper(use_db=False)
    scraper.run()
    
    # Exemple d'utilisation avec MongoDB
    # scraper = BRVMScraper(use_db=True, db_uri="mongodb://localhost:27017/")
    # scraper.run()
