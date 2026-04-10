# Déploiement — Concours de Dessins

## Prérequis serveur

Sur le serveur Ubuntu 24.04 (some1one.me / 37.27.92.243) :

```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Nginx (si pas déjà installé)
sudo apt install -y nginx

# Certbot SSL (si pas déjà fait)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d some1one.me -d www.some1one.me
```

## Premier déploiement

```bash
# 1. Cloner le dépôt
REPO_URL=https://github.com/VOTRE_USER/VOTRE_REPO.git
git clone $REPO_URL /opt/concours-dessins
cd /opt/concours-dessins

# 2. Lancer
docker compose up -d --build

# 3. Configurer Nginx
sudo cp nginx/concours-dessins.conf /etc/nginx/sites-available/concours-dessins
sudo ln -sf /etc/nginx/sites-available/concours-dessins /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

L'application est accessible sur https://some1one.me

## Mises à jour

### Manuelle
```bash
cd /opt/concours-dessins
git pull origin main
docker compose down && docker compose up -d --build
```

### Automatique (GitHub Actions)
Configurez ces secrets dans GitHub → Settings → Secrets and variables → Actions :

| Secret           | Valeur                     |
|-----------------|----------------------------|
| `SERVER_HOST`   | `37.27.92.243`             |
| `SERVER_USER`   | `root` (ou votre user SSH) |
| `SSH_PRIVATE_KEY`| Votre clé privée SSH       |

Chaque `git push` sur `main` déclenche automatiquement le redéploiement.

### Script deploy.sh
```bash
cd /opt/concours-dessins
./deploy.sh
```

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Status des conteneurs
docker compose ps

# Redémarrer
docker compose restart

# Rebuilder sans cache
docker compose build --no-cache && docker compose up -d

# Sauvegarder la base SQLite
docker cp concours-dessins:/app/server/concours_dessins.db ./backup.db

# Réinitialiser la base
docker compose exec app node init-db.js
```

## Architecture

```
Internet → Nginx (443/SSL) → Docker:3001 (Express + React SPA)
                                ├── API REST (/api/*)
                                ├── Frontend SPA (dist/)
                                └── SQLite DB (sql.js)
```

## Structure des fichiers de déploiement

```
├── Dockerfile            # Build multi-stage (frontend + backend)
├── docker-compose.yml    # Orchestration des services
├── deploy.sh             # Script de déploiement manuel
├── .github/workflows/
│   └── deploy.yml        # CI/CD GitHub Actions
├── nginx/
│   └── concours-dessins.conf  # Config Nginx reverse proxy + SSL
└── .dockerignore         # Exclusions du build Docker
```
