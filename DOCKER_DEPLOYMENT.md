# Docker Deployment Guide

## Overview

The Cloud Database Inventory application is packaged as three Docker images:
- **cloud-db-inventory-backend** - FastAPI backend service (556MB)
- **cloud-db-inventory-frontend** - Nginx-based React frontend (48.8MB)
- **PostgreSQL 17** - Database (official image from Docker Hub)

## Prerequisites

- Docker and Docker Compose installed on your target machine
- At least 2GB available disk space
- Network connectivity to pull base images from Docker Hub

## Option 1: Deploy Using Docker Compose (Recommended)

### Step 1: Prepare the Deployment Directory

```bash
# Create deployment directory
mkdir cloud-db-inventory-deploy
cd cloud-db-inventory-deploy

# Copy docker-compose.yml
# Copy all files from the repository root directory:
# - docker-compose.yml
# - docker-initdb/
# - frontend/nginx.conf
```

### Step 2: Configure Environment Variables

Create a `.env` file for production configuration:

```bash
cat > .env << 'EOF'
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=cloud_db_inventory

# Backend Configuration
DATABASE_URL=postgresql://postgres:your-secure-password-here@postgres:5432/cloud_db_inventory
PYTHONUNBUFFERED=1

# Frontend Configuration
# The frontend will proxy API requests to the backend service
EOF
```

**Important:** Change `your-secure-password-here` to a secure password.

### Step 3: Start the Services

```bash
docker-compose up -d
```

This command will:
1. Pull the PostgreSQL 17 image from Docker Hub
2. Create the database
3. Start the backend service (API on port 8000)
4. Start the frontend service (UI on port 3000)

### Step 4: Verify Deployment

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME                             STATUS
# cloud-db-inventory-postgres      Healthy
# cloud-db-inventory-backend       Running
# cloud-db-inventory-frontend      Running

# Check logs
docker-compose logs -f frontend
```

### Step 5: Access the Application

- **Frontend UI:** http://your-machine-ip:3000
- **Backend API:** http://your-machine-ip:8000
- **API Documentation:** http://your-machine-ip:8000/docs

## Option 2: Load Pre-Built Docker Images

If you have the Docker image files saved locally (`.tar` format):

```bash
# Load the images
docker load -i cloud-db-inventory-backend-latest.tar
docker load -i cloud-db-inventory-frontend-latest.tar

# Verify they're loaded
docker images | grep cloud-db-inventory
```

Then proceed with Option 1 (docker-compose).

## Option 3: Deploy to Docker Registry

### Push Images to a Registry

If you want to push to Docker Hub or a private registry:

```bash
# Tag images
docker tag cloud-db-inventory-backend:latest your-registry/cloud-db-inventory-backend:latest
docker tag cloud-db-inventory-frontend:latest your-registry/cloud-db-inventory-frontend:latest

# Push to registry
docker push your-registry/cloud-db-inventory-backend:latest
docker push your-registry/cloud-db-inventory-frontend:latest
```

### Update docker-compose.yml

Modify the image references in `docker-compose.yml`:

```yaml
backend:
  image: your-registry/cloud-db-inventory-backend:latest
  # ... rest of config

frontend:
  image: your-registry/cloud-db-inventory-frontend:latest
  # ... rest of config
```

Then deploy with:

```bash
docker-compose pull
docker-compose up -d
```

## Docker Image Details

### Backend Image
- **Base Image:** python:3.12-slim
- **Size:** 556MB
- **Key Components:**
  - FastAPI framework
  - SQLAlchemy ORM
  - Uvicorn application server
  - PostgreSQL client libraries

### Frontend Image
- **Base Image:** nginx:1.27-alpine (production build)
- **Build Base:** node:20-alpine (build time only)
- **Size:** 48.8MB
- **Key Features:**
  - React application built with Vite
  - Nginx reverse proxy for API requests
  - Static file serving

## Storage and Data Persistence

The PostgreSQL data is stored in a Docker volume:

```bash
# Check volume
docker volume ls | grep pgdata

# Backup data
docker-compose exec postgres pg_dumpall -U postgres > backup.sql

# Restore from backup
docker exec -i cloud-db-inventory-postgres psql -U postgres < backup.sql
```

## Database Initialization

On first startup, the following initialization script runs:

- **Location:** `docker-initdb/01-init.sql`
- **Purpose:** Creates database schema and initial seed data

To skip initialization (if database already exists), remove the `docker-initdb` mount:

```yaml
# In docker-compose.yml, remove or comment out:
# - ./docker-initdb:/docker-entrypoint-initdb.d:ro
```

## Common Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```bash
# Graceful stop (preserves data)
docker-compose down

# Remove volumes too (DELETE DATA!)
docker-compose down -v
```

### Restart Services

```bash
docker-compose restart

# Or specific service
docker-compose restart backend
```

### Execute Commands in Container

```bash
# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec postgres psql -U postgres -d cloud_db_inventory
```

## Production Best Practices

### 1. Security

```bash
# Use strong passwords
POSTGRES_PASSWORD=<generate-secure-random-password>

# Run containers as non-root (if possible)
# Ensure proper file permissions on mounted volumes
chmod 600 /path/to/pgdata
```

### 2. Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
  
  frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 3. Monitoring

```bash
# Check container resource usage
docker stats

# Check service health
docker-compose ps

# Check logs for errors
docker-compose logs | grep -i error
```

### 4. Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dumpall -U postgres > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql
```

### 5. Network Configuration

For production deployments:

```yaml
services:
  postgres:
    ports:
      - "127.0.0.1:5432:5432"  # Only allow localhost connections
```

## Troubleshooting

### Issue: Container won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Port already in use: Change port mapping
# - Out of disk space: Free up space
# - Database connection failed: Check DATABASE_URL
```

### Issue: Database connection errors

```bash
# Verify database is running and healthy
docker-compose ps

# Check database logs
docker-compose logs postgres

# Try connecting directly
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

### Issue: Frontend shows API errors

```bash
# Verify backend is running
curl http://localhost:8000/api/stats

# Check frontend logs
docker-compose logs frontend

# Check nginx configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

## Updating the Application

### Pull Latest Images

```bash
docker-compose down
docker pull cloud-db-inventory-backend:latest
docker pull cloud-db-inventory-frontend:latest
docker-compose up -d
```

### Update from Source

```bash
git pull origin main
docker-compose build
docker-compose up -d
```

## Uninstallation

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (DELETE DATA!)
docker-compose down -v

# Remove images
docker rmi cloud-db-inventory-backend:latest
docker rmi cloud-db-inventory-frontend:latest
```

## Support

For issues or questions:
1. Check application logs: `docker-compose logs`
2. Review this deployment guide
3. Verify all services are running: `docker-compose ps`
4. Check network connectivity between containers
5. Verify port availability and firewall settings

## Image Specifications

| Component | Metric | Value |
|-----------|--------|-------|
| Backend | Image Size | 556MB |
| Backend | Base Image | python:3.12-slim |
| Backend | Port | 8000 |
| Frontend | Image Size | 48.8MB |
| Frontend | Base Image | nginx:1.27-alpine |
| Frontend | Port | 80 (exposed as 3000) |
| Database | Image | postgres:17-alpine |
| Database | Port | 5432 |
| Total | Combined Size | ~1.2GB (with base images) |

