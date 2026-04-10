#!/bin/bash
# deploy.sh — Script de déploiement pour le serveur Ubuntu (some1one.me)
# Usage: ./deploy.sh
set -euo pipefail

APP_DIR="/opt/concours-dessins"
REPO_URL="https://github.com/npoupbach2025/tp-db.git"

echo "=== Déploiement Concours de Dessins ==="

# 1. Pull latest code
if [ -d "$APP_DIR" ]; then
    echo ">> Pull des dernières modifications..."
    cd "$APP_DIR"
    git pull origin master
else
    echo ">> Clonage initial du dépôt..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# 2. Build and restart containers
echo ">> Build et redémarrage des conteneurs..."
docker compose down
docker compose build --no-cache
docker compose up -d

# 3. Wait for health check
echo ">> Attente du démarrage de l'application..."
sleep 5
for i in $(seq 1 12); do
    if curl -sf http://localhost:3001/api/dashboard/stats > /dev/null 2>&1; then
        echo ">> Application démarrée avec succès!"
        break
    fi
    if [ "$i" -eq 12 ]; then
        echo ">> Attention: l'application ne répond pas encore. Vérifiez les logs:"
        echo "   docker compose logs -f"
        exit 1
    fi
    echo "   Tentative $i/12..."
    sleep 5
done

# 4. Copy nginx config if not already done
NGINX_CONF="/etc/nginx/sites-available/concours-dessins"
if [ ! -f "$NGINX_CONF" ]; then
    echo ">> Installation de la config Nginx..."
    sudo cp nginx/concours-dessins.conf "$NGINX_CONF"
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo ">> Nginx configuré."
else
    echo ">> Config Nginx déjà en place."
fi

echo ""
echo "=== Déploiement terminé ==="
echo "Application: https://some1one.me"
echo "Logs:        docker compose logs -f"
echo "Status:      docker compose ps"
