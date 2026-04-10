#!/bin/sh
# entrypoint.sh — Initialize DB on first run, then start server
set -e

DB_FILE="${DB_PATH:-/app/server/concours_dessins.db}"

if [ ! -f "$DB_FILE" ]; then
    echo "=== Premiere execution: initialisation de la base de donnees ==="
    node init-db.js
    echo "=== Base initialisee ==="
fi

echo "=== Demarrage du serveur ==="
exec node index.js
