#!/bin/sh
# Arranque del contenedor de desarrollo del tracking (Vite).
#
# node_modules vive en un volumen de Docker (binarios de Linux). Se reinstala cuando cambia
# package-lock.json (por ejemplo, tras un `git pull` con un paquete nuevo).
#
# `--force`: package.json fija `@rolldown/binding-win32-x64-msvc`, un binario solo de Windows
# que npm añadió al instalar en Windows. En Linux `npm ci` lo rechaza (EBADPLATFORM); con
# --force lo omite y usa los binarios de Linux que el lockfile ya trae (-gnu y -musl).
set -e

HUELLA_LOCK=$(sha1sum package-lock.json | cut -d' ' -f1)
MARCA=node_modules/.package-lock.sha1

if [ "$(cat "$MARCA" 2>/dev/null)" != "$HUELLA_LOCK" ]; then
    echo "package-lock.json cambió (o node_modules está vacío): instalando dependencias..."
    npm ci --force --no-audit --no-fund
    echo "$HUELLA_LOCK" > "$MARCA"
fi

exec "$@"
