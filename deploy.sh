#!/usr/bin/env bash
set -Eeuo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info() { printf '%b[INFO]%b  %s\n' "$CYAN" "$NC" "$*"; }
ok() { printf '%b[OK]%b    %s\n' "$GREEN" "$NC" "$*"; }
warn() { printf '%b[WARN]%b  %s\n' "$YELLOW" "$NC" "$*"; }
err() { printf '%b[ERR]%b   %s\n' "$RED" "$NC" "$*" >&2; }
trap 'err "Deployment failed at line $LINENO. Existing containers were not intentionally stopped before this failure."' ERR

usage() {
  printf 'Usage: %s [all|api|web|landing] [--no-cache]\n' "$0"
  printf '\nDeploy one application or all applications. Default: all\n'
  printf '  api       Build and deploy umkm-pos-api (also ensures database is running)\n'
  printf '  web       Build and deploy umkm-pos-web\n'
  printf '  landing   Build and deploy umkm-pos-landing\n'
  printf '  all       Build and deploy all three applications\n'
  printf '  --no-cache  Build without Docker cache\n'
  printf '  -h, --help  Show this help\n'
}

TARGET=all
NO_CACHE=()
for arg in "$@"; do
  case "$arg" in
    all|api|web|landing) TARGET="$arg" ;;
    --no-cache) NO_CACHE+=(--no-cache) ;;
    -h|--help) usage; exit 0 ;;
    *) err "Unknown argument: $arg"; usage; exit 2 ;;
  esac
done

command -v docker >/dev/null || { err 'Docker is not installed'; exit 1; }
docker compose version >/dev/null || { err 'Docker Compose v2 is required'; exit 1; }
docker compose config -q || { err 'docker-compose.yml is invalid'; exit 1; }

case "$TARGET" in
  api) SERVICES=(umkm-pos-api); CONTAINERS=(umkm-pos-api); DEPENDS=(umkm-pos-db) ;;
  web) SERVICES=(umkm-pos-web); CONTAINERS=(umkm-pos-web); DEPENDS=() ;;
  landing) SERVICES=(umkm-pos-landing); CONTAINERS=(umkm-pos-landing); DEPENDS=() ;;
  all) SERVICES=(umkm-pos-api umkm-pos-web umkm-pos-landing); CONTAINERS=(umkm-pos-api umkm-pos-web umkm-pos-landing); DEPENDS=(umkm-pos-db) ;;
esac

info "Target: $TARGET"
info 'Building image(s) before changing running containers...'
docker compose build "${NO_CACHE[@]}" "${SERVICES[@]}"
ok 'Image build completed'

if ((${#DEPENDS[@]})); then
  docker compose up -d --no-build "${DEPENDS[@]}"
  ok 'Database dependency is running'
fi

info 'Deploying application container(s)...'
docker compose up -d --no-build "${SERVICES[@]}"

for container in "${CONTAINERS[@]}"; do
  for _ in {1..15}; do
    state=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || true)
    [[ "$state" == running ]] && break
    sleep 2
  done
  state=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || true)
  if [[ "$state" != running ]]; then
    err "$container is not running (state: ${state:-missing})"
    docker logs "$container" --tail 40 2>&1 || true
    exit 1
  fi
  ok "$container is running"
done

# Application-level checks: these do not mutate data.
if [[ "$TARGET" == api || "$TARGET" == all ]]; then
  for _ in {1..15}; do
    if curl -fsS --max-time 3 http://127.0.0.1:3000/api/v1/catalog/products >/tmp/umkm-pos-api-check 2>/dev/null; then
      ok 'API responded successfully (database route reached)'
      break
    fi
    # A validation response is also proof that Nest is serving requests.
    code=$(curl -sS -o /tmp/umkm-pos-api-check -w '%{http_code}' --max-time 3 http://127.0.0.1:3000/api/v1/catalog/products || true)
    if [[ "$code" == 400 || "$code" == 401 || "$code" == 403 ]]; then
      ok "API responded with HTTP $code (application is serving)"
      break
    fi
    sleep 2
  done
  code=$(curl -sS -o /tmp/umkm-pos-api-check -w '%{http_code}' --max-time 3 http://127.0.0.1:3000/api/v1/catalog/products || true)
  [[ "$code" != 5* && "$code" != 000 ]] || { err "API health probe failed with HTTP $code"; docker logs umkm-pos-api --tail 40 2>&1; exit 1; }
fi

printf '\n%bDeployment successful%b\n' "$GREEN" "$NC"
docker ps --filter "name=^/\(umkm-pos-api\|umkm-pos-web\|umkm-pos-landing\)$" --format '  {{.Names}} | {{.Status}}'
warn 'S3 warning, if present, only affects file uploads.'
rm -f /tmp/umkm-pos-api-check
