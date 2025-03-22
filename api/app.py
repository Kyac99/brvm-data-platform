#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
API BRVM Data Platform
API REST pour servir les données de la BRVM
"""

import os
import json
import datetime
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pathlib import Path

# Création de l'application Flask
app = Flask(__name__)
CORS(app)  # Autoriser les requêtes cross-origin

# Configuration des chemins
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
WEB_DIR = BASE_DIR / "web"

# Assurer que les répertoires existent
DATA_DIR.mkdir(exist_ok=True)
RAW_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)


@app.route('/api/market-status', methods=['GET'])
def get_market_status():
    """Récupère le statut actuel du marché"""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    try:
        # Essayer de charger le fichier du jour
        status_file = RAW_DIR / f"market_status_{today}.json"
        
        if status_file.exists():
            with open(status_file, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        else:
            # Si le fichier n'existe pas, récupérer le plus récent
            status_files = list(RAW_DIR.glob("market_status_*.json"))
            
            if status_files:
                latest_file = max(status_files, key=lambda f: f.name)
                with open(latest_file, 'r', encoding='utf-8') as f:
                    return jsonify(json.load(f))
            else:
                # Aucun fichier trouvé, renvoyer un statut par défaut
                return jsonify({
                    "market_status": "closed",
                    "last_update": datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                })
    
    except Exception as e:
        app.logger.error(f"Erreur lors de la récupération du statut du marché: {e}")
        return jsonify({"error": "Erreur lors de la récupération du statut du marché"}), 500


@app.route('/api/indices', methods=['GET'])
def get_indices():
    """Récupère les indices boursiers"""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    try:
        # Essayer de charger le fichier CSV du jour
        indices_file = PROCESSED_DIR / f"indices_{today}.csv"
        
        if indices_file.exists():
            indices_df = pd.read_csv(indices_file)
            return jsonify(indices_df.to_dict(orient='records'))
        else:
            # Si le fichier n'existe pas, récupérer le plus récent
            indices_files = list(PROCESSED_DIR.glob("indices_*.csv"))
            
            if indices_files:
                latest_file = max(indices_files, key=lambda f: f.name)
                indices_df = pd.read_csv(latest_file)
                return jsonify(indices_df.to_dict(orient='records'))
            else:
                # Aucun fichier trouvé, renvoyer une liste vide
                return jsonify([])
    
    except Exception as e:
        app.logger.error(f"Erreur lors de la récupération des indices: {e}")
        return jsonify({"error": "Erreur lors de la récupération des indices"}), 500


@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    """Récupère les actions cotées"""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    try:
        # Essayer de charger le fichier CSV du jour
        stocks_file = PROCESSED_DIR / f"stocks_{today}.csv"
        
        if stocks_file.exists():
            stocks_df = pd.read_csv(stocks_file)
            return jsonify(stocks_df.to_dict(orient='records'))
        else:
            # Si le fichier n'existe pas, récupérer le plus récent
            stocks_files = list(PROCESSED_DIR.glob("stocks_*.csv"))
            
            if stocks_files:
                latest_file = max(stocks_files, key=lambda f: f.name)
                stocks_df = pd.read_csv(latest_file)
                return jsonify(stocks_df.to_dict(orient='records'))
            else:
                # Aucun fichier trouvé, renvoyer une liste vide
                return jsonify([])
    
    except Exception as e:
        app.logger.error(f"Erreur lors de la récupération des actions: {e}")
        return jsonify({"error": "Erreur lors de la récupération des actions"}), 500


@app.route('/api/bonds', methods=['GET'])
def get_bonds():
    """Récupère les obligations"""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    try:
        # Essayer de charger le fichier CSV du jour
        bonds_file = PROCESSED_DIR / f"bonds_{today}.csv"
        
        if bonds_file.exists():
            bonds_df = pd.read_csv(bonds_file)
            return jsonify(bonds_df.to_dict(orient='records'))
        else:
            # Si le fichier n'existe pas, récupérer le plus récent
            bonds_files = list(PROCESSED_DIR.glob("bonds_*.csv"))
            
            if bonds_files:
                latest_file = max(bonds_files, key=lambda f: f.name)
                bonds_df = pd.read_csv(latest_file)
                return jsonify(bonds_df.to_dict(orient='records'))
            else:
                # Aucun fichier trouvé, renvoyer une liste vide
                return jsonify([])
    
    except Exception as e:
        app.logger.error(f"Erreur lors de la récupération des obligations: {e}")
        return jsonify({"error": "Erreur lors de la récupération des obligations"}), 500


@app.route('/api/news', methods=['GET'])
def get_news():
    """Récupère les actualités du marché"""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    try:
        # Essayer de charger le fichier JSON du jour
        news_file = RAW_DIR / f"news_{today}.json"
        
        if news_file.exists():
            with open(news_file, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        else:
            # Si le fichier n'existe pas, récupérer le plus récent
            news_files = list(RAW_DIR.glob("news_*.json"))
            
            if news_files:
                latest_file = max(news_files, key=lambda f: f.name)
                with open(latest_file, 'r', encoding='utf-8') as f:
                    return jsonify(json.load(f))
            else:
                # Aucun fichier trouvé, renvoyer une liste vide
                return jsonify([])
    
    except Exception as e:
        app.logger.error(f"Erreur lors de la récupération des actualités: {e}")
        return jsonify({"error": "Erreur lors de la récupération des actualités"}), 500


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_web(path):
    """Sert les fichiers statiques du répertoire web"""
    return send_from_directory(WEB_DIR, path)


if __name__ == '__main__':
    # Démarrer le serveur en mode développement
    app.run(debug=True, host='0.0.0.0', port=5000)
