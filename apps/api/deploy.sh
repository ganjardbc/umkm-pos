#!/usr/bin/env bash

# ==============================================================================
# WisataPOS - API Deployment Script
# ==============================================================================
# This script automates the deployment of apps/api (NestJS + Prisma + MySQL).
# Supports both Docker Compose and Local Node.js / PM2 deployment.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Setup colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper for printing messages
log_info() {
  echo -e "${BLUE}${BOLD}[INFO]${NC} $1"
}
log_success() {
  echo -e "${GREEN}${BOLD}[SUCCESS]${NC} $1"
}
log_warn() {
  echo -e "${YELLOW}${BOLD}[WARNING]${NC} $1"
}
log_error() {
  echo -e "${RED}${BOLD}[ERROR]${NC} $1"
}

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_DIR="$SCRIPT_DIR"

show_usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -m, --mode <docker|pm2>   Deployment mode: 'docker' (Docker Compose) or 'pm2' (PM2 process)"
  echo "  --skip-tests              Skip running tests before deployment"
  echo "  --skip-build              Skip building application code"
  echo "  --skip-migrations         Skip database migration deploy"
  echo "  --env <path>              Path to custom environment file (defaults to apps/api/.env)"
  echo "  -h, --help                Show this help message"
  echo ""
}

# Initialize variables
DEPLOY_MODE=""
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_MIGRATIONS=false
ENV_FILE="$API_DIR/.env"

# Parse arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -m|--mode)
      DEPLOY_MODE="$2"
      shift
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS=true
      shift
      ;;
    --env)
      ENV_FILE="$2"
      shift
      shift
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

log_info "=== WisataPOS API Deployment ==="
log_info "Workspace root: $WORKSPACE_ROOT"
log_info "API directory: $API_DIR"

# Validate Environment File
if [ ! -f "$ENV_FILE" ]; then
  # Fallback to root .env if default API .env doesn't exist
  if [ -f "$WORKSPACE_ROOT/.env" ]; then
    log_warn "Environment file not found at $ENV_FILE. Sourcing root .env at $WORKSPACE_ROOT/.env instead."
    ENV_FILE="$WORKSPACE_ROOT/.env"
  else
    log_error "Environment file not found at: $ENV_FILE"
    log_info "Please make sure a .env file exists either in apps/api/.env or in the workspace root."
    exit 1
  fi
fi
log_success "Environment file found: $ENV_FILE"

# Extract database connection & port details
get_env_var() {
  local var_name=$1
  local file_path=$2
  grep -v '^#' "$file_path" | grep "^${var_name}=" | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

PORT=$(get_env_var "PORT" "$ENV_FILE")
PORT=${PORT:-3000}
DATABASE_URL=$(get_env_var "DATABASE_URL" "$ENV_FILE")
JWT_SECRET=$(get_env_var "JWT_SECRET" "$ENV_FILE")
NODE_ENV=$(get_env_var "NODE_ENV" "$ENV_FILE")
NODE_ENV=${NODE_ENV:-production}

# Quick security validation for production mode
if [ "$NODE_ENV" = "production" ]; then
  log_warn "NODE_ENV is set to production. Running security checks..."
  if [ "$JWT_SECRET" = "your_jwt_secret_here" ] || [ "$JWT_SECRET" = "dev_secret_change_me" ] || [ -z "$JWT_SECRET" ]; then
    log_error "SECURITY ERROR: JWT_SECRET is unsafe or empty. Deployment blocked."
    exit 1
  fi
  log_success "Security validation passed."
fi

# Detect deployment mode if not specified
if [ -z "$DEPLOY_MODE" ]; then
  if [ -t 0 ]; then
    echo -e "${BOLD}Select Deployment Mode:${NC}"
    echo "  1) Docker Compose (Containers)"
    echo "  2) PM2 / Node.js (Local/Bare-metal)"
    read -p "Enter choice (1 or 2): " choice
    case "$choice" in
      1) DEPLOY_MODE="docker" ;;
      2) DEPLOY_MODE="pm2" ;;
      *) log_error "Invalid choice. Aborting."; exit 1 ;;
    esac
  else
    log_error "No deployment mode specified and stdin is not a TTY. Please use --mode <docker|pm2>."
    exit 1
  fi
fi

# Requirement checks
check_local_requirements() {
  log_info "Checking local build requirements..."
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed."
    exit 1
  fi
  if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed."
    exit 1
  fi
  log_success "Node.js $(node -v) and pnpm $(pnpm -v) found."
}

check_docker_requirements() {
  log_info "Checking Docker requirements..."
  if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed."
    exit 1
  fi
  if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running."
    exit 1
  fi
  
  # Determine docker compose syntax
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
  elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
  else
    log_error "Docker Compose is not installed (neither 'docker compose' nor 'docker-compose' found)."
    exit 1
  fi
  log_success "Docker & Docker Compose ($DOCKER_COMPOSE_CMD) ready."
}

verify_deployment() {
  log_info "Verifying deployment status..."
  log_info "Waiting 5 seconds for application to start..."
  sleep 5
  
  local health_url="http://localhost:${PORT}/api/v1"
  log_info "Checking API endpoint: $health_url"
  
  if command -v curl &> /dev/null; then
    # Curl with max 5s timeout
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$health_url" || echo "failed")
    if [ "$status_code" = "200" ] || [ "$status_code" = "401" ] || [ "$status_code" = "404" ] || [ "$status_code" = "403" ]; then
      log_success "API is up and responding! (HTTP Status: $status_code)"
    else
      log_warn "Could not verify connection to API (HTTP Status: $status_code)."
      log_warn "Ensure the service is running, and that port $PORT is open."
    fi
  else
    log_warn "curl not found, skipping verification ping."
  fi
}

deploy_docker() {
  check_docker_requirements
  
  log_info "Deploying via Docker Compose..."
  cd "$WORKSPACE_ROOT"
  
  if [ "$SKIP_BUILD" = false ]; then
    log_info "Building docker images..."
    $DOCKER_COMPOSE_CMD build umkm-pos-api
  fi
  
  log_info "Starting DB service..."
  $DOCKER_COMPOSE_CMD up -d umkm-pos-db
  
  log_info "Waiting for database container to accept connections..."
  local max_attempts=15
  local attempt=1
  local db_ready=false
  while [ $attempt -le $max_attempts ]; do
    if docker exec umkm-pos-db mysqladmin ping -u root --password=rootpassword &> /dev/null; then
      db_ready=true
      break
    fi
    log_info "Database not ready yet (attempt $attempt/$max_attempts), retrying in 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  if [ "$db_ready" = false ]; then
    log_error "Database connection timeout. Aborting."
    exit 1
  fi
  log_success "Database is ready."
  
  log_info "Starting API service (forcing container recreation with new image)..."
  $DOCKER_COMPOSE_CMD up -d --force-recreate --no-deps umkm-pos-api
  
  if [ "$SKIP_MIGRATIONS" = false ]; then
    log_info "Running database migrations inside API container..."
    # Execute prisma migrate deploy in the api container
    $DOCKER_COMPOSE_CMD exec -T umkm-pos-api npx prisma migrate deploy
  fi
  
  log_success "Docker Compose deployment complete."
}

deploy_pm2() {
  check_local_requirements
  
  log_info "Deploying via Local Node.js / PM2..."
  
  # Export environment variables for the current shell build context
  export DATABASE_URL="$DATABASE_URL"
  export PORT="$PORT"
  export JWT_SECRET="$JWT_SECRET"
  export NODE_ENV="$NODE_ENV"
  
  # Run tests first
  if [ "$SKIP_TESTS" = false ]; then
    log_info "Running tests..."
    (cd "$WORKSPACE_ROOT" && pnpm --filter umkm-pos-api test)
  fi
  
  # Clean install & build
  if [ "$SKIP_BUILD" = false ]; then
    log_info "Installing dependencies..."
    (cd "$WORKSPACE_ROOT" && pnpm install --frozen-lockfile)
    
    log_info "Building shared types package..."
    (cd "$WORKSPACE_ROOT" && pnpm --filter @umkm-pos/shared-types build)
    
    log_info "Building API application..."
    (cd "$WORKSPACE_ROOT" && pnpm --filter umkm-pos-api build)
  fi
  
  # Generate client & apply migrations
  if [ "$SKIP_MIGRATIONS" = false ]; then
    log_info "Generating Prisma Client and running migrations..."
    (cd "$API_DIR" && npx prisma generate && npx prisma migrate deploy)
  fi
  
  # PM2 process execution
  log_info "Restarting API process..."
  if command -v pm2 &> /dev/null; then
    if pm2 show umkm-pos-api &> /dev/null; then
      log_info "Restarting existing PM2 process: umkm-pos-api..."
      (cd "$API_DIR" && pm2 restart umkm-pos-api --update-env)
    else
      log_info "Starting new PM2 process: umkm-pos-api..."
      (cd "$API_DIR" && pm2 start dist/src/main.js --name umkm-pos-api --update-env)
    fi
    pm2 save
    log_success "PM2 process umkm-pos-api is running."
  else
    log_warn "PM2 is not installed. You can start the service manually in production:"
    log_warn "  cd apps/api && pnpm run start:prod"
  fi
}

# Run deployment
if [ "$DEPLOY_MODE" = "docker" ]; then
  deploy_docker
elif [ "$DEPLOY_MODE" = "pm2" ]; then
  deploy_pm2
else
  log_error "Unknown deployment mode: $DEPLOY_MODE"
  exit 1
fi

# Verify status
verify_deployment

log_success "API deployment completed successfully in '$DEPLOY_MODE' mode."
